#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

class PropertyPurger {
  constructor() {
    this.purged = [];
    this.errors = [];
  }

  async purgeOldProperties() {
    console.log('🗑️  Starting property purging process...');
    
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago
    
    console.log(`📅 Purging properties older than: ${cutoffDate.toLocaleDateString()}`);
    
    // Process active properties
    await this.purgeFromFile('../database/properties/active.json', cutoffDate, 'active');
    
    // Process pending properties
    await this.purgeFromFile('../database/properties/pending.json', cutoffDate, 'pending');
    
    // Save purged properties to archived
    if (this.purged.length > 0) {
      await this.archivePurgedProperties();
    }
    
    // Update last purge record
    await this.updatePurgeRecord();
    
    console.log('✅ Property purging completed');
    console.log(`📊 Summary: ${this.purged.length} purged, ${this.errors.length} errors`);
    
    return {
      purged: this.purged.length,
      errors: this.errors.length
    };
  }
  
  async purgeFromFile(filePath, cutoffDate, type) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const data = await fs.readJson(fullPath).catch(() => ({ properties: [] }));
      
      const originalCount = data.properties.length;
      const activePropspopperties = [];
      const purgedProperties = [];
      
      for (const property of data.properties) {
        const scrapedDate = new Date(property.scraped_at);
        
        if (scrapedDate < cutoffDate) {
          purgedProperties.push({
            ...property,
            purged_at: new Date().toISOString(),
            purged_from: type
          });
        } else {
          activePropspopperties.push(property);
        }
      }
      
      // Update the file with remaining properties
      data.properties = activePropspopperties;
      data.last_updated = new Date().toISOString();
      data.total_count = activePropspopperties.length;
      data.last_purged = new Date().toISOString();
      data.purged_count = purgedProperties.length;
      
      await fs.writeJson(fullPath, data, { spaces: 2 });
      
      this.purged = [...this.purged, ...purgedProperties];
      
      console.log(`🗂️  ${type}: ${originalCount} -> ${activePropspopperties.length} (${purgedProperties.length} purged)`);
      
    } catch (error) {
      console.error(`❌ Error purging ${type} properties:`, error.message);
      this.errors.push({
        type,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async archivePurgedProperties() {
    try {
      const archiveFile = path.join(__dirname, '../database/properties/archived.json');
      let archiveData = { properties: [], last_updated: null };
      
      try {
        archiveData = await fs.readJson(archiveFile);
      } catch (error) {
        console.log('Creating new archived.json file');
      }
      
      // Add purged properties to archive
      archiveData.properties = [...archiveData.properties, ...this.purged];
      archiveData.last_updated = new Date().toISOString();
      archiveData.total_count = archiveData.properties.length;
      
      // Keep only last 1000 archived properties to prevent file from growing too large
      if (archiveData.properties.length > 1000) {
        archiveData.properties = archiveData.properties.slice(-1000);
        archiveData.total_count = 1000;
        console.log('📦 Trimmed archive to last 1000 properties');
      }
      
      await fs.writeJson(archiveFile, archiveData, { spaces: 2 });
      
      console.log(`📦 Archived ${this.purged.length} purged properties`);
      
    } catch (error) {
      console.error('❌ Error archiving purged properties:', error.message);
      this.errors.push({
        action: 'archive',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async updatePurgeRecord() {
    try {
      const purgeFile = path.join(__dirname, '../database/purging/last-purge.json');
      const purgeData = {
        timestamp: new Date().toISOString(),
        purged_count: this.purged.length,
        errors: this.errors.length,
        next_purge: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days from now
      };
      
      await fs.ensureDir(path.dirname(purgeFile));
      await fs.writeJson(purgeFile, purgeData, { spaces: 2 });
      
      console.log('💾 Updated purge record');
      
    } catch (error) {
      console.error('❌ Error updating purge record:', error.message);
    }
  }
  
  // Remove exact duplicates based on title and location similarity
  async removeDuplicates() {
    console.log('🔄 Removing duplicate properties...');
    
    const activeFile = path.join(__dirname, '../database/properties/active.json');
    const data = await fs.readJson(activeFile).catch(() => ({ properties: [] }));
    
    const uniqueProperties = [];
    const duplicates = [];
    
    for (const property of data.properties) {
      const isDuplicate = uniqueProperties.some(existing => {
        const titleSimilarity = this.calculateSimilarity(property.title, existing.title);
        const locationSimilarity = this.calculateSimilarity(property.location, existing.location);
        
        return titleSimilarity > 0.85 && locationSimilarity > 0.8;
      });
      
      if (!isDuplicate) {
        uniqueProperties.push(property);
      } else {
        duplicates.push(property);
      }
    }
    
    if (duplicates.length > 0) {
      data.properties = uniqueProperties;
      data.total_count = uniqueProperties.length;
      data.last_updated = new Date().toISOString();
      data.duplicates_removed = duplicates.length;
      
      await fs.writeJson(activeFile, data, { spaces: 2 });
      
      console.log(`🗑️  Removed ${duplicates.length} duplicate properties`);
    } else {
      console.log('✅ No duplicates found');
    }
    
    return duplicates.length;
  }
  
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
  }
  
  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }
}

// Run if called directly
if (require.main === module) {
  const purger = new PropertyPurger();
  
  // Run duplicate removal first, then purging
  purger.removeDuplicates()
    .then(() => purger.purgeOldProperties())
    .then(results => {
      console.log('🎉 Property maintenance completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Property maintenance failed:', error);
      process.exit(1);
    });
}

module.exports = PropertyPurger;