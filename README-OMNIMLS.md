# OmniMLS Integration

## Overview
OmniMLS (https://omnimls.com) is a **Mexican MLS system** that lists properties across **all of Latin America**. This integration scrapes **Costa Rica properties ONLY** and filters out all other countries.

## Configuration

### Source Details
- **Name**: OmniMLS Costa Rica  
- **Base URL**: `https://omnimls.com`
- **Language**: English version (`/en/`)
- **Priority**: 1 (same as other professional MLSagents)
- **Scrape Frequency**: Every 6 hours (with all other sources)
- **Max Pages**: 200 per endpoint
- **Country Filter**: **Costa Rica ONLY**

### Endpoints Scraped
1. **Sale Properties**: `/v/results/listing-type_sale`
2. **Rent Properties**: `/v/results/listing-type_rent`

### Filtering Strategy
Since OmniMLS lists properties from **Mexico, Colombia, Panama, Costa Rica, and other Latin American countries**, the scraper:

1. **Scrapes all listings** from the general search pages
2. **Filters properties client-side** by checking:
   - Property location field
   - Property description
   - Property title
3. **Only saves properties** that contain "costa rica" (case-insensitive)
4. **Rejects all other** properties with a skip log message

## Technical Details

### CSS Selectors
The scraper uses **fallback selectors** to handle OmniMLS's dynamic JavaScript rendering:

```json
{
  "listing": ".property-card, .listing-card, .resultado, article[class*='property'], [data-listing-id], .card, [class*='item']",
  "title": ".property-title, .listing-title, .titulo, h3, h4, h2, .title, [class*='title']",
  "price": ".property-price, .listing-price, .precio, .price, [class*='price']",
  "location": ".property-location, .listing-location, .ubicacion, .location, .address, [class*='location']",
  "details": ".property-description, .listing-description, .descripcion, .description, [class*='description']",
  "images": ".property-image img, .listing-image img, .gallery img, img[class*='property']",
  "link": "a[href*='/listing/']"
}
```

### JavaScript Rendering
OmniMLS is a **JavaScript-heavy site** (WordPress + Elementor + WooCommerce), so the scraper:
- Uses **Puppeteer** (headless Chrome) instead of simple HTTP requests
- Waits **5 seconds** for JavaScript to render (longer than other sources)
- Handles cookie banners and modals automatically

### Code Implementation
The country filtering is implemented in `/scripts/scraper.js`:

```javascript
// Filter by country if specified (for multi-country sources like OmniMLS)
if (sourceConfig.filter_country) {
  const filterCountry = sourceConfig.filter_country.toLowerCase();
  const locationText = (property.location || '').toLowerCase();
  const descriptionText = (property.description || '').toLowerCase();
  const titleText = (property.title || '').toLowerCase();
  const combinedText = `${locationText} ${descriptionText} ${titleText}`;
  
  // Check if property is in the target country
  if (!combinedText.includes(filterCountry)) {
    console.log(`      ⏭️  Skipped (not in ${filterCountry}): ${property.title}...`);
    continue; // Skip this property
  }
}
```

## Testing

### Test the Integration
Run the test script to verify OmniMLS scraping:

```bash
node scripts/test-omnimls-scraper.js
```

This will:
- Load the OmniMLS configuration
- Test the first endpoint
- Verify CSS selectors work
- Check Costa Rica filtering
- Show sample property data

### Run Full Scraper
To scrape OmniMLS along with all other sources:

```bash
node scripts/scraper.js
```

### Check Results
After scraping, check the pending properties:

```bash
cat database/properties/pending.json | grep -i "omnimls"
```

### Verify Costa Rica Only
Ensure no non-Costa Rica properties were scraped:

```bash
cat database/properties/pending.json | jq '.properties[] | select(.source == "omnimls_cr") | .location'
```

All locations should contain "Costa Rica".

## Automation

### GitHub Actions
OmniMLS is automatically scraped by the existing GitHub Actions workflow:

**File**: `.github/workflows/autonomous-mls.yml`

**Schedule**: Every 6 hours (0 */6 * * *)

**Workflow includes**:
1. Property scraping (all sources including OmniMLS)
2. Database updates (GitHub JSON files)
3. IPFS deployment (new properties published)
4. Email campaigns (new listings sent to subscribers)

### Manual Trigger
To manually scrape OmniMLS immediately:

```bash
gh workflow run "Autonomous Costa Rica MLS" --field action=scrape
```

## Expected Results

### Volume Estimate
- **Total OmniMLS Listings**: ~500-2000 (all Latin America)
- **Costa Rica Listings**: ~50-200 (estimated 5-10%)
- **Duplicates**: Will be filtered by title similarity

### Property Categories
Properties will be automatically categorized as:
- **Luxury**: High-end homes, exclusive estates
- **Residential**: Houses, condos, apartments
- **Commercial**: Offices, retail spaces
- **Land**: Lots, acreage, development land

### Data Enrichment
Costa Rica properties from OmniMLS will be enriched with:
- BCCR exchange rates and market data
- Registro Nacional property records (if available)
- Municipal tax information
- Flood risk assessments
- School proximity data

## Troubleshooting

### No Properties Found
If the scraper finds 0 properties:

1. **Check the site is accessible**:
   ```bash
   curl -I https://omnimls.com/v/results/listing-type_sale
   ```

2. **Run the test script** to see detailed selector results:
   ```bash
   node scripts/test-omnimls-scraper.js
   ```

3. **Check scraper logs**:
   ```bash
   cat logs/pipeline-*.json | jq '.errors[] | select(.source == "omnimls_cr")'
   ```

### Wrong Country Properties
If non-Costa Rica properties are scraped:

1. **Check the filter is active**:
   ```bash
   cat database/scraping/sources.json | jq '.sources.omnimls_cr.filter_country'
   ```
   Should return: `"costa rica"`

2. **Verify property location fields**:
   ```bash
   cat database/properties/pending.json | jq '.properties[] | 
     select(.source == "omnimls_cr") | 
     {title, location, description}'
   ```

3. **Adjust filter logic** in `scripts/scraper.js` if needed

### Selectors Not Working
If the CSS selectors fail to find listings:

1. **Inspect the OmniMLS HTML** manually:
   ```bash
   curl -s "https://omnimls.com/v/results/listing-type_sale" | 
     grep -E "class=\"[^\"]*card|class=\"[^\"]*property|class=\"[^\"]*listing" | 
     head -20
   ```

2. **Update selectors** in `database/scraping/sources.json`:
   ```json
   "listing": ".new-selector-discovered"
   ```

3. **Re-run test** to verify:
   ```bash
   node scripts/test-omnimls-scraper.js
   ```

## Maintenance

### Selector Updates
OmniMLS may update their site design. To maintain compatibility:

1. **Monitor scrape success rate** in logs
2. **Run test script quarterly** to verify selectors
3. **Update selectors** in sources.json as needed
4. **Test before deploying** to production

### Rate Limiting
The scraper respects OmniMLS with:
- **1.5 second delay** between page requests
- **5 second wait** for JavaScript rendering
- **User-Agent**: "CostaRica-MLS-Bot/1.0"
- **robots.txt compliance**: Enabled

### Performance
OmniMLS scraping is **slower** than other sources due to:
- JavaScript rendering wait time (5s per page)
- Large number of pages (200 max)
- Country filtering overhead

**Estimated scraping time**: 15-25 minutes per run

## Integration Checklist

✅ **Configuration**
- [x] Added to `database/scraping/sources.json`
- [x] Costa Rica country filter enabled
- [x] Endpoints configured (sale + rent)
- [x] CSS selectors with fallbacks
- [x] Priority set to 1 (6h frequency)

✅ **Code Changes**
- [x] Country filtering logic in `scripts/scraper.js`
- [x] Longer JavaScript wait time for OmniMLS
- [x] Deprecated `waitForTimeout` replaced with `setTimeout`

✅ **Testing**
- [x] Test script created (`test-omnimls-scraper.js`)
- [x] Selector validation available
- [x] Costa Rica filtering testable

✅ **Documentation**
- [x] Integration guide (this file)
- [x] Troubleshooting section
- [x] Testing instructions
- [x] Expected results documented

## Next Steps

1. **Run initial test**:
   ```bash
   node scripts/test-omnimls-scraper.js
   ```

2. **Run full scraper**:
   ```bash
   node scripts/scraper.js
   ```

3. **Verify Costa Rica only**:
   ```bash
   cat database/properties/pending.json | jq '.properties[] | 
     select(.source == "omnimls_cr") | .location' | 
     grep -i "costa rica" | wc -l
   ```

4. **Deploy to production**:
   ```bash
   git add .
   git commit -m "Add OmniMLS integration for Costa Rica properties"
   git push origin main
   ```

5. **Monitor first automated run** (next 6-hour cycle)

## Contact & Support

For issues with OmniMLS integration:
- Check logs: `logs/pipeline-*.json`
- Run diagnostics: `node scripts/test-omnimls-scraper.js`
- Review this guide: `README-OMNIMLS.md`

---

**Last Updated**: November 2025  
**OmniMLS Version**: Current (WordPress + Elementor)  
**Integration Status**: ✅ Active
