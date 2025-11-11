# 🇨🇷 Costa Rica MLS Real-Data Pipeline

## Overview

The Costa Rica MLS Real-Data Pipeline is a fully automated system that gathers **real property listings** from multiple sources, enriches them with official Costa Rican public data, and generates professional PDF reports. The system runs autonomously via GitHub Actions every 6 hours.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│   Enrichment     │───▶│     Output      │
│                 │    │                  │    │                 │
│ • Encuentra24   │    │ • BCCR Exchange  │    │ • JSON Database │
│ • Craigslist    │    │ • Registro Nac.  │    │ • PDF Reports   │
│ • (Lamudi)      │    │ • Municipal Tax  │    │ • IPFS Deploy   │
│                 │    │ • Flood Risk     │    │                 │
└─────────────────┘    │ • Schools        │    └─────────────────┘
                       │ • Energy Cert.   │
                       └──────────────────┘
```

## 🔧 Setup Instructions

### 1. Required GitHub Secrets

Configure these secrets in your repository settings (`Settings > Secrets and variables > Actions`):

```bash
# BCCR (Central Bank of Costa Rica) API Access
BCCR_API_USER=your_bccr_username
BCCR_API_PASS=your_bccr_password

# Registro Nacional (Property Registry) Access  
REGISTRO_NACIONAL_CERT=base64_encoded_certificate
REGISTRO_NACIONAL_TOKEN=your_registry_token

# Municipal Open Data APIs (Optional)
SANJOSE_OPENDATA_TOKEN=your_sanjose_token
ESCAZU_OPENDATA_TOKEN=your_escazu_token
SANTAANA_OPENDATA_TOKEN=your_santaana_token
```

### 2. How to Get API Credentials

#### BCCR API (Central Bank)
1. Visit: https://gee.bccr.fi.cr/
2. Register for API access
3. Submit business justification for real estate data usage
4. Receive credentials via email (usually 3-5 business days)

#### Registro Nacional
1. Visit: https://www.registronacional.go.cr/
2. Apply for digital certificate for property lookups
3. Submit notarized application with business documentation
4. Receive certificate and token (processing time: 2-4 weeks)

#### Municipal APIs
- **San José**: https://datosabiertos.msj.go.cr/
- **Escazú**: Contact municipality directly
- **Santa Ana**: Contact municipality directly

### 3. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/CR_MLS_New.git
cd CR_MLS_New

# Install dependencies
npm install
cd client && npm install && cd ..

# Create local environment file (optional)
cp .env.example .env
# Edit .env with your API credentials

# Run the pipeline locally
node scripts/real-data-pipeline.js
```

## 📊 Data Sources

### Primary Sources

| Source | Type | Rate Limit | Data Coverage |
|--------|------|------------|---------------|
| **Encuentra24** | API | 5 req/sec | ~80% of Costa Rica listings |
| **Craigslist** | RSS/Web | 2 req/sec | ~15% of listings, expat market |
| ~~Lamudi~~ | ❌ Skipped | N/A | No API access |

### Enrichment Sources

| Service | Purpose | Rate Limit | Data Type |
|---------|---------|------------|-----------|
| **BCCR** | Exchange rates, housing price index | 2 req/sec | Economic indicators |
| **Registro Nacional** | Property ownership, cadastral data | 1 req/sec | Legal/ownership |
| **MOPT ArcGIS** | Flood risk assessment | 3 req/sec | Risk analysis |
| **MINAE** | Energy efficiency certifications | 3 req/sec | Environmental |
| **Municipal APIs** | Property taxes, zoning | 3 req/sec | Local government |

## 🔄 Pipeline Process

### Step 1: Data Collection
- **Encuentra24**: Query reverse-engineered JSON API for all property types
- **Craigslist**: Parse RSS feed, then scrape individual listing pages
- **Rate Limiting**: Automatic throttling respects each service's limits

### Step 2: Data Enrichment
For each property listing, the system attempts to gather:

```typescript
interface PropertyEnrichment {
  registro_nacional?: {
    cadastral_number: string;
    owner_name: string;
    title_status: 'clear' | 'encumbered' | 'disputed';
  };
  
  municipal_tax?: {
    valor_catastral: number;      // Cadastral value (CRC)
    impuesto_territorial: number;  // Annual property tax
    luxury_tax_applicable: boolean;
  };
  
  market_data?: {
    market_price_index: number;           // BCCR housing index
    average_mortgage_rate_percent: number; // Current rates
    exchange_rate_usd_crc: number;        // Live exchange rate
  };
  
  flood_risk?: {
    risk_level: 'low' | 'medium' | 'high';
    zone_classification: string;
  };
  
  schools?: {
    nearest_public_school: { name: string; distance_km: number; };
    nearest_private_school: { name: string; distance_km: number; };
  };
  
  energy_efficiency?: {
    certified: boolean;
    certification_level?: 'A' | 'B' | 'C' | 'D' | 'E';
  };
}
```

### Step 3: Storage & Processing
- **Atomic Updates**: Database changes are written atomically to prevent corruption
- **Deduplication**: Listings are identified by `SHA-256(source + external_id)`
- **Versioning**: Each listing tracks `scraped_at`, `last_updated` timestamps

### Step 4: PDF Generation
- Professional reports generated for each enriched property
- Templates match industry MLS standards
- Stored in `public/pdfs/` for IPFS deployment

## 📁 Output Structure

```
database/
├── listings.json          # Main enriched property database
└── stats/
    ├── pipeline-run.json   # Latest pipeline statistics
    └── enrichment-log.json # Enrichment success/failure log

public/pdfs/
├── {listing_id}_basic.pdf     # Basic contact reports
├── {listing_id}_legal.pdf     # Legal compliance reports  
└── {listing_id}_complete.pdf  # Complete due diligence

logs/
├── pipeline-{timestamp}.json  # Complete pipeline run logs
└── enrichment-errors.json    # Failed enrichment attempts
```

## 🎯 Sample Output

### Enriched Property Listing
```json
{
  "listing_id": "encuentra24_abc123def456",
  "source": "encuentra24",
  "title": "Luxury Villa in Escazú with Ocean Views",
  "price_usd": 750000,
  "address": "Escazú, San José, Costa Rica",
  "province": "San José",
  "property_type": "house",
  "bedrooms": 4,
  "bathrooms": 3,
  "area_m2": 350,
  "coordinates": { "lat": 9.9281, "lng": -84.1402 },
  
  "enrichment": {
    "municipal_tax": {
      "valor_catastral": 382500000,
      "impuesto_territorial": 9562500,
      "luxury_tax_applicable": true,
      "payment_status": "current"
    },
    "market_data": {
      "market_price_index": 127.5,
      "average_mortgage_rate_percent": 8.5,
      "exchange_rate_usd_crc": 510.25
    },
    "flood_risk": {
      "risk_level": "low",
      "zone_classification": "Zone A"
    },
    "schools": {
      "nearest_public_school": {
        "name": "Escuela República de Francia",
        "distance_km": 1.2
      }
    },
    "energy_efficiency": {
      "certified": true,
      "certification_level": "B"
    }
  }
}
```

## 🚀 Deployment

### Automatic Deployment
The system deploys automatically via GitHub Actions:
- **Trigger**: Every 6 hours via cron schedule
- **Process**: Scrape → Enrich → Store → Generate PDFs → Deploy to IPFS
- **Monitoring**: Full audit trail in JSON logs

### Manual Deployment
```bash
# Run full pipeline
node scripts/real-data-pipeline.js

# Deploy to IPFS manually
cd client
npm run build
./scripts/deploy-ipfs.sh
```

## 🔍 Monitoring & Logs

### Pipeline Statistics
Each run generates comprehensive statistics:
```json
{
  "startTime": "2024-01-15T12:00:00Z",
  "endTime": "2024-01-15T12:15:00Z", 
  "durationMs": 900000,
  "sources": {
    "encuentra24": { "listings": 150, "errors": 2 },
    "craigslist": { "listings": 25, "errors": 0 }
  },
  "enrichment": {
    "attempted": 175,
    "successful": 168,
    "failed": 7
  },
  "output": {
    "totalListings": 175,
    "pdfsGenerated": 175
  }
}
```

### Error Handling
- **Graceful Degradation**: Failed enrichment steps don't block the entire process
- **Retry Logic**: Exponential backoff for transient failures
- **Comprehensive Logging**: Every API call and error is logged with context

## 🛠️ Development

### Adding New Data Sources
1. Create scraper in `src/sources/new-source.ts`
2. Implement `RawListing` interface
3. Add to main pipeline in `scripts/real-data-pipeline.js`
4. Update GitHub Actions workflow

### Adding New Enrichment Steps
1. Create enrichment module in `src/enrich/new-enrichment.ts`
2. Update `PropertyEnrichment` interface in `src/types.ts`
3. Add to enrichment pipeline
4. Update PDF templates to display new data

### Testing
```bash
# Run unit tests
npm test

# Run integration tests with mock data
npm run test:integration

# Run pipeline with limited data (for testing)
NODE_ENV=test node scripts/real-data-pipeline.js
```

## ⚠️ Important Notes

### Rate Limiting
The system respects all API rate limits:
- **Never exceed 5 requests/second** for any service
- **Automatic backoff** on 429 responses
- **Distributed load** across multiple sources

### Data Privacy
- **No personal information** is stored beyond what's publicly available
- **Property owner names** are only used for legal verification
- **All data** comes from public or authorized sources

### Legal Compliance
- **Terms of Service**: Ensure compliance with each data source's ToS
- **API Usage**: Only use APIs for legitimate real estate business purposes
- **Data Retention**: Follow local data protection regulations

## 📞 Support

- **Issues**: Open a GitHub issue with detailed logs
- **API Access**: Contact respective government agencies for credentials
- **Commercial Use**: Ensure proper licensing for commercial deployment

## 🎯 Roadmap

- [ ] **Phase 2**: Add property valuation models
- [ ] **Phase 3**: Integrate with additional MLS systems  
- [ ] **Phase 4**: Machine learning for property recommendations
- [ ] **Phase 5**: Real-time notifications for price changes

---

**🇨🇷 Built for Costa Rica's Real Estate Market**  
*Pura Vida Real Estate Data*