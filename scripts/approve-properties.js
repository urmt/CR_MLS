#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

class PropertyApprover {
  async approveAllPendingProperties() {
    console.log('📋 Moving pending properties to active...');
    
    // Load files
    const activeFile = path.join(__dirname, '../database/properties/active.json');
    const pendingFile = path.join(__dirname, '../database/properties/pending.json');
    
    let activeData = { properties: [], last_updated: null };
    let pendingData = { properties: [], last_updated: null };
    
    try {
      activeData = await fs.readJson(activeFile);
    } catch (error) {
      console.log('Creating new active.json file');
    }
    
    try {
      pendingData = await fs.readJson(pendingFile);
    } catch (error) {
      console.log('No pending properties found');
      return;
    }
    
    if (pendingData.properties.length === 0) {
      console.log('No pending properties to approve');
      return;
    }
    
    console.log(`Found ${pendingData.properties.length} pending properties`);
    
    // Move all pending properties to active
    activeData.properties = [...activeData.properties, ...pendingData.properties];
    activeData.last_updated = new Date().toISOString();
    
    // Clear pending
    pendingData.properties = [];
    pendingData.last_updated = new Date().toISOString();
    
    // Save both files
    await fs.writeJson(activeFile, activeData, { spaces: 2 });
    await fs.writeJson(pendingFile, pendingData, { spaces: 2 });
    
    console.log(`✅ Approved ${pendingData.properties.length} properties`);
    console.log(`🏠 Total active properties: ${activeData.properties.length}`);
    console.log('🌐 Properties will now appear on the website!');
  }
  
  async run() {
    try {
      await this.approveAllPendingProperties();
    } catch (error) {
      console.error('❌ Property approval failed:', error);
      process.exit(1);
    }
  }
}

// Run the approver
if (require.main === module) {
  const approver = new PropertyApprover();
  approver.run().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = PropertyApprover;