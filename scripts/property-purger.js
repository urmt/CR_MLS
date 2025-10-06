#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

class PropertyPurger {
  constructor() {
    this.PURGE_DAYS = 90; // Auto-purge listings older than 90 days
    this.results = {
      total_active: 0,
      total_pending: 0,
      purged_active: 0,
      purged_pending: 0,
      moved_to_archived: 0
    };
  }

  async loadPropertyFile(filePath) {
    try {
      const data = await fs.readJson(filePath);
      return data;
    } catch (error) {
      console.warn(`Could not load ${filePath}:`, error.message);
      return { properties: [], last_updated: null };
    }
  }

  async savePropertyFile(filePath, data) {
    await fs.writeJson(filePath, data, { spaces: 2 });
  }

  isOlderThan90Days(scrapedAt) {
    if (!scrapedAt) return true; // If no date, assume old

    const scrapedDate = new Date(scrapedAt);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.PURGE_DAYS);
    
    return scrapedDate < cutoffDate;
  }

  async purgeActiveProperties() {
    console.log('🔍 Purging active properties older than 90 days...');
    
    const activeFilePath = path.join(__dirname, '../database/properties/active.json');
    const archivedFilePath = path.join(__dirname, '../database/properties/archived.json');
    
    // Load active properties
    const activeData = await this.loadPropertyFile(activeFilePath);
    const archivedData = await this.loadPropertyFile(archivedFilePath);
    
    this.results.total_active = activeData.properties.length;
    
    // Separate current and old properties
    const currentProperties = [];
    const oldProperties = [];
    
    for (const property of activeData.properties) {
      if (this.isOlderThan90Days(property.scraped_at)) {
        oldProperties.push({
          ...property,
          archived_at: new Date().toISOString(),
          archive_reason: '90_day_auto_purge'
        });
        this.results.purged_active++;
      } else {
        currentProperties.push(property);
      }
    }
    
    // Update active properties file with only current properties
    activeData.properties = currentProperties;
    activeData.last_updated = new Date().toISOString();
    await this.savePropertyFile(activeFilePath, activeData);
    
    // Move old properties to archived
    if (oldProperties.length > 0) {
      archivedData.properties = [...archivedData.properties, ...oldProperties];
      archivedData.last_updated = new Date().toISOString();
      await this.savePropertyFile(archivedFilePath, archivedData);
      this.results.moved_to_archived += oldProperties.length;
    }
    
    console.log(`  ✅ Active: ${this.results.purged_active} properties moved to archived`);
  }

  async purgePendingProperties() {
    console.log('🔍 Purging pending properties older than 90 days...');
    
    const pendingFilePath = path.join(__dirname, '../database/properties/pending.json');
    const archivedFilePath = path.join(__dirname, '../database/properties/archived.json');
    
    // Load pending properties
    const pendingData = await this.loadPropertyFile(pendingFilePath);
    const archivedData = await this.loadPropertyFile(archivedFilePath);
    
    this.results.total_pending = pendingData.properties.length;
    
    // Separate current and old properties
    const currentProperties = [];
    const oldProperties = [];
    
    for (const property of pendingData.properties) {
      if (this.isOlderThan90Days(property.scraped_at)) {
        oldProperties.push({
          ...property,
          archived_at: new Date().toISOString(),
          archive_reason: '90_day_auto_purge_pending'
        });
        this.results.purged_pending++;
      } else {
        currentProperties.push(property);
      }
    }
    
    // Update pending properties file with only current properties
    pendingData.properties = currentProperties;
    pendingData.last_updated = new Date().toISOString();
    await this.savePropertyFile(pendingFilePath, pendingData);
    
    // Move old properties to archived
    if (oldProperties.length > 0) {
      archivedData.properties = [...archivedData.properties, ...oldProperties];
      archivedData.last_updated = new Date().toISOString();
      await this.savePropertyFile(archivedFilePath, archivedData);
      this.results.moved_to_archived += oldProperties.length;
    }
    
    console.log(`  ✅ Pending: ${this.results.purged_pending} properties moved to archived`);
  }

  async limitArchivedProperties() {
    console.log('🗂️ Limiting archived properties to last 365 days...');
    
    const archivedFilePath = path.join(__dirname, '../database/properties/archived.json');
    const archivedData = await this.loadPropertyFile(archivedFilePath);
    
    if (archivedData.properties.length === 0) {
      console.log('  ✅ No archived properties to limit');
      return;
    }
    
    // Keep only properties archived in the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    
    const recentlyArchived = archivedData.properties.filter(property => {
      const archivedAt = property.archived_at || property.scraped_at;
      if (!archivedAt) return false;
      
      return new Date(archivedAt) > oneYearAgo;
    });
    
    const removedCount = archivedData.properties.length - recentlyArchived.length;
    
    if (removedCount > 0) {
      archivedData.properties = recentlyArchived;
      archivedData.last_updated = new Date().toISOString();
      await this.savePropertyFile(archivedFilePath, archivedData);
      console.log(`  ✅ Removed ${removedCount} very old archived properties (>1 year)`);
    } else {
      console.log('  ✅ All archived properties are recent enough');
    }
  }

  async savePurgeLog() {
    const logData = {
      timestamp: new Date().toISOString(),
      purge_days: this.PURGE_DAYS,
      results: this.results
    };
    
    const logFilePath = path.join(__dirname, '../database/purging/last-purge.json');
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(logFilePath));
    
    // Load existing log history
    let logHistory = { purge_history: [] };
    try {
      logHistory = await fs.readJson(logFilePath);
      // Ensure purge_history exists and is an array
      if (!logHistory.purge_history || !Array.isArray(logHistory.purge_history)) {
        logHistory.purge_history = [];
      }
    } catch (error) {
      // File doesn't exist, will create new one
    }
    
    // Add this run to history (keep last 30 runs)
    logHistory.purge_history = [logData, ...logHistory.purge_history].slice(0, 30);
    logHistory.last_updated = new Date().toISOString();
    
    await fs.writeJson(logFilePath, logHistory, { spaces: 2 });
  }

  async run() {
    console.log('🗑️ Starting 90-day property purge process...');
    console.log(`📅 Properties scraped before ${new Date(Date.now() - this.PURGE_DAYS * 24 * 60 * 60 * 1000).toISOString()} will be archived`);
    
    try {
      await this.purgeActiveProperties();
      await this.purgePendingProperties();
      await this.limitArchivedProperties();
      await this.savePurgeLog();
      
      console.log('✅ Property purge completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   Total Active: ${this.results.total_active} (${this.results.purged_active} purged)`);
      console.log(`   Total Pending: ${this.results.total_pending} (${this.results.purged_pending} purged)`);
      console.log(`   Moved to Archive: ${this.results.moved_to_archived} properties`);
      
      const remainingActive = this.results.total_active - this.results.purged_active;
      const remainingPending = this.results.total_pending - this.results.purged_pending;
      const totalRemaining = remainingActive + remainingPending;
      
      console.log(`🎯 Database size optimized: ${totalRemaining} active properties remaining`);
      
    } catch (error) {
      console.error('❌ Property purge failed:', error);
      process.exit(1);
    }
  }
}

// Run the purger
if (require.main === module) {
  const purger = new PropertyPurger();
  purger.run().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = PropertyPurger;