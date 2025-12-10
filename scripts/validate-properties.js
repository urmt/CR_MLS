#!/usr/bin/env node

/**
 * Property Data Validation Script
 * Validates database structure and data integrity
 */

const fs = require('fs-extra');
const path = require('path');

const REQUIRED_FIELDS = ['id', 'title', 'price_usd', 'source', 'scraped_at'];
const OPTIONAL_FIELDS = ['description', 'location', 'images', 'url', 'category'];
const ALLOWED_SOURCES = [
  'encuentra24_cr',
  'craigslist_cr',
  'omnimls_cr',
  'coldwell_banker_cr',
  'remax_cr',
  'remax_oceansurf',
  'immo_cr'
];

let errorCount = 0;
let warningCount = 0;

function logError(msg) {
  console.error(`❌ ERROR: ${msg}`);
  errorCount++;
}

function logWarning(msg) {
  console.warn(`⚠️  WARNING: ${msg}`);
  warningCount++;
}

function logSuccess(msg) {
  console.log(`✅ ${msg}`);
}

function validateProperty(prop, index, filePath) {
  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!prop[field]) {
      logError(`Property at index ${index} in ${filePath} missing required field: ${field}`);
      return false;
    }
  }

  // Validate ID format
  if (typeof prop.id !== 'string' || prop.id.trim() === '') {
    logError(`Property at index ${index} has invalid ID format`);
    return false;
  }

  // Validate price
  if (typeof prop.price_usd !== 'number' || prop.price_usd < 0) {
    logError(
      `Property "${prop.title}" (${prop.id}) has invalid price: ${prop.price_usd}`
    );
    return false;
  }

  // Validate source
  if (!ALLOWED_SOURCES.includes(prop.source)) {
    logWarning(
      `Property "${prop.title}" has unknown source: ${prop.source}. ` +
      `Expected one of: ${ALLOWED_SOURCES.join(', ')}`
    );
  }

  // Validate scraped_at is ISO date
  if (!isValidISODate(prop.scraped_at)) {
    logError(
      `Property "${prop.title}" has invalid scraped_at date: ${prop.scraped_at}`
    );
    return false;
  }

  // Validate images array if present
  if (prop.images) {
    if (!Array.isArray(prop.images)) {
      logError(`Property "${prop.title}" images field must be an array`);
      return false;
    }
    if (prop.images.some(img => typeof img !== 'string')) {
      logError(`Property "${prop.title}" has non-string values in images array`);
      return false;
    }
  }

  // Validate URL if present
  if (prop.url && typeof prop.url !== 'string') {
    logWarning(`Property "${prop.title}" has invalid URL field`);
  }

  return true;
}

function isValidISODate(dateString) {
  if (typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function validateDatabaseFile(filePath) {
  console.log(`\n📋 Validating: ${filePath}`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let data;

    try {
      data = JSON.parse(content);
    } catch (e) {
      logError(`Invalid JSON in ${filePath}: ${e.message}`);
      return false;
    }

    // Check structure
    if (!Array.isArray(data) && !data.properties) {
      logError(
        `${filePath} must be an array or have a 'properties' field`
      );
      return false;
    }

    const properties = Array.isArray(data) ? data : data.properties;

    if (!Array.isArray(properties)) {
      logError(`${filePath} properties field must be an array`);
      return false;
    }

    // Validate each property
    let validCount = 0;
    for (let i = 0; i < properties.length; i++) {
      if (validateProperty(properties[i], i, filePath)) {
        validCount++;
      }
    }

    logSuccess(
      `${validCount}/${properties.length} properties valid in ${path.basename(filePath)}`
    );
    return validCount === properties.length;
  } catch (error) {
    logError(`Failed to validate ${filePath}: ${error.message}`);
    return false;
  }
}

function validateDatabaseStructure() {
  console.log('🔍 Validating database structure...\n');

  const dbPath = path.join(__dirname, '..', 'database');
  const files = [
    'properties/active.json',
    'properties/pending.json',
    'properties/sold.json',
    'properties/archived.json',
    'scraping/sources.json',
    'config/categories.json'
  ];

  let allValid = true;

  for (const file of files) {
    const filePath = path.join(dbPath, file);
    if (fs.existsSync(filePath)) {
      if (!validateDatabaseFile(filePath)) {
        allValid = false;
      }
    } else {
      logWarning(`Expected file not found: ${filePath}`);
    }
  }

  return allValid;
}

function validateNoDuplicates() {
  console.log('\n🔍 Checking for duplicate properties...');

  try {
    const activePath = path.join(__dirname, '..', 'database', 'properties', 'active.json');
    const pendingPath = path.join(__dirname, '..', 'database', 'properties', 'pending.json');

    let allProps = [];

    if (fs.existsSync(activePath)) {
      const active = fs.readJsonSync(activePath);
      allProps = allProps.concat(Array.isArray(active) ? active : active.properties || []);
    }

    if (fs.existsSync(pendingPath)) {
      const pending = fs.readJsonSync(pendingPath);
      allProps = allProps.concat(Array.isArray(pending) ? pending : pending.properties || []);
    }

    const seen = new Set();
    let duplicates = 0;

    for (const prop of allProps) {
      if (seen.has(prop.id)) {
        logError(`Duplicate property ID found: ${prop.id}`);
        duplicates++;
      }
      seen.add(prop.id);
    }

    if (duplicates === 0) {
      logSuccess(`No duplicate property IDs found (${seen.size} unique properties)`);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logWarning(`Could not check for duplicates: ${error.message}`);
    return true; // Don't fail on this check alone
  }
}

function main() {
  console.log('🚀 Costa Rica MLS - Property Data Validator\n');

  const structureValid = validateDatabaseStructure();
  const noDuplicates = validateNoDuplicates();

  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));

  if (errorCount > 0) {
    console.error(`\n❌ ${errorCount} error(s) found`);
  } else {
    console.log('\n✅ No errors found');
  }

  if (warningCount > 0) {
    console.warn(`⚠️  ${warningCount} warning(s) found`);
  }

  console.log('='.repeat(60) + '\n');

  if (errorCount > 0) {
    process.exit(1);
  } else {
    logSuccess('Validation passed!');
    process.exit(0);
  }
}

main();
