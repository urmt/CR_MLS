# GitHub Database Structure

This directory contains the JSON-based database files that will be stored in a GitHub repository for free, persistent storage.

## Structure:
```
database/
├── properties/
│   ├── active.json          # Currently listed properties
│   ├── sold.json           # Historical sold properties  
│   ├── pending.json        # Properties pending verification
│   └── archived.json       # Old/expired listings
├── subscribers/
│   ├── by-category.json    # Email subscribers by property type
│   ├── by-region.json      # Email subscribers by location
│   └── preferences.json    # User email preferences
├── scraping/
│   ├── sources.json        # Costa Rica property sources to scrape
│   ├── last-run.json      # Last scraping run timestamps
│   └── errors.json        # Scraping error logs
└── config/
    ├── categories.json     # Property categories and pricing
    ├── regions.json        # Costa Rica regions and zones
    └── automation.json     # Email automation settings
```

## GitHub Actions Workflow:
1. **Daily Property Scraper** (runs every 6 hours)
2. **Weekly Property Purger** (removes old listings)  
3. **Email Campaign Sender** (sends category-based emails)
4. **Database Backup to IPFS** (mirrors data to IPFS)