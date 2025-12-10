#!/usr/bin/env node

/**
 * Costa Rica MLS - Error Recovery Script
 * Handles various failure scenarios with automated recovery
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '..', 'database', 'backups');
const DB_DIR = path.join(__dirname, '..', 'database');

function log(type, msg) {
  const symbols = { success: '✅', error: '❌', warning: '⚠️ ', info: 'ℹ️ ' };
  console.log(`${symbols[type] || type} ${msg}`);
}

function getLatestBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return null;
    }
    const files = fs.readdirSync(BACKUP_DIR).sort().reverse();
    return files.length > 0 ? path.join(BACKUP_DIR, files[0]) : null;
  } catch (e) {
    return null;
  }
}

function restoreFromBackup(backupFile) {
  try {
    log('info', `Restoring from backup: ${path.basename(backupFile)}`);
    execSync(`tar -xzf "${backupFile}" -C "${DB_DIR}"`, { stdio: 'inherit' });
    log('success', 'Database restored from backup');
    return true;
  } catch (e) {
    log('error', `Failed to restore backup: ${e.message}`);
    return false;
  }
}

function repairDatabase() {
  log('info', 'Attempting to repair database...');

  try {
    const dirs = [
      'properties',
      'scraping',
      'config',
      'subscribers',
      'agents',
      'deployments'
    ];

    for (const dir of dirs) {
      const dirPath = path.join(DB_DIR, dir);
      if (!fs.existsSync(dirPath)) {
        fs.ensureDirSync(dirPath);
        log('warning', `Created missing directory: ${dir}`);
      }
    }

    // Validate and repair JSON files
    const jsonFiles = [
      'properties/active.json',
      'properties/pending.json',
      'properties/sold.json',
      'properties/archived.json',
      'scraping/sources.json',
      'config/categories.json'
    ];

    for (const file of jsonFiles) {
      const filePath = path.join(DB_DIR, file);

      if (!fs.existsSync(filePath)) {
        // Create empty file
        const defaultContent = file.includes('properties')
          ? JSON.stringify({ properties: [], last_updated: new Date().toISOString() }, null, 2)
          : JSON.stringify({}, null, 2);

        fs.writeFileSync(filePath, defaultContent);
        log('warning', `Created missing file: ${file}`);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content); // Validate
      } catch (e) {
        log('warning', `Repairing corrupted JSON: ${file}`);

        // Try to recover with backup
        const backup = getLatestBackup();
        if (backup && file.includes('properties')) {
          restoreFromBackup(backup);
          return;
        }

        // Fall back to empty file
        const defaultContent = file.includes('properties')
          ? JSON.stringify({ properties: [], last_updated: new Date().toISOString() }, null, 2)
          : JSON.stringify({}, null, 2);

        fs.writeFileSync(filePath, defaultContent);
        log('warning', `Reset to empty: ${file}`);
      }
    }

    log('success', 'Database repair completed');
    return true;
  } catch (e) {
    log('error', `Repair failed: ${e.message}`);
    return false;
  }
}

function deduplicateProperties() {
  log('info', 'Deduplicating properties...');

  try {
    const activePath = path.join(DB_DIR, 'properties', 'active.json');
    if (!fs.existsSync(activePath)) {
      log('warning', 'No active properties to deduplicate');
      return true;
    }

    const data = fs.readJsonSync(activePath);
    const properties = Array.isArray(data) ? data : data.properties || [];

    const seen = new Map();
    const duplicates = [];

    for (const prop of properties) {
      if (seen.has(prop.id)) {
        duplicates.push(prop.id);
      } else {
        seen.set(prop.id, prop);
      }
    }

    if (duplicates.length > 0) {
      log('warning', `Found ${duplicates.length} duplicate properties`);

      // Keep only unique properties
      const unique = Array.from(seen.values());
      fs.writeJsonSync(
        activePath,
        {
          properties: unique,
          last_updated: new Date().toISOString(),
          total_count: unique.length
        },
        { spaces: 2 }
      );

      log('success', `Removed ${duplicates.length} duplicates, kept ${unique.length} unique`);
      return true;
    } else {
      log('success', `No duplicates found (${properties.length} properties)`);
      return true;
    }
  } catch (e) {
    log('error', `Deduplication failed: ${e.message}`);
    return false;
  }
}

function rotateLogs() {
  log('info', 'Rotating old log files...');

  try {
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      log('warning', 'No logs directory found');
      return true;
    }

    const files = fs.readdirSync(logsDir);
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    let rotated = 0;
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.mtime.getTime() < twoWeeksAgo) {
        fs.removeSync(filePath);
        rotated++;
      }
    }

    if (rotated > 0) {
      log('success', `Rotated ${rotated} old log files`);
    } else {
      log('success', 'All logs are recent');
    }

    return true;
  } catch (e) {
    log('warning', `Log rotation failed: ${e.message}`);
    return true; // Don't fail on this
  }
}

function main() {
  const action = process.argv[2];

  console.log('\n🔧 Costa Rica MLS - Error Recovery Tool\n');

  switch (action) {
    case 'restore': {
      const backup = process.argv[3] || getLatestBackup();
      if (!backup) {
        log('error', 'No backup file specified or found');
        process.exit(1);
      }
      if (restoreFromBackup(backup)) {
        process.exit(0);
      } else {
        process.exit(1);
      }
      break;
    }

    case 'repair': {
      if (repairDatabase()) {
        process.exit(0);
      } else {
        process.exit(1);
      }
      break;
    }

    case 'deduplicate': {
      if (deduplicateProperties()) {
        process.exit(0);
      } else {
        process.exit(1);
      }
      break;
    }

    case 'rotate-logs': {
      if (rotateLogs()) {
        process.exit(0);
      } else {
        process.exit(1);
      }
      break;
    }

    case 'full': {
      log('info', 'Running full recovery procedure...\n');

      if (repairDatabase() && deduplicateProperties() && rotateLogs()) {
        log('success', 'Full recovery completed successfully');
        process.exit(0);
      } else {
        log('error', 'Some recovery steps failed');
        process.exit(1);
      }
      break;
    }

    default: {
      console.log(`Usage: node recovery.js <action> [options]

Actions:
  restore [backup-file]  - Restore from backup (uses latest if not specified)
  repair                 - Repair corrupted database files
  deduplicate            - Remove duplicate properties
  rotate-logs            - Clean old log files
  full                   - Run all recovery procedures

Examples:
  node recovery.js full
  node recovery.js restore database/backups/backup-1234567890.json
  node recovery.js repair
`);
      process.exit(1);
    }
  }
}

main();
