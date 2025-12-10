# 🏠 Costa Rica MLS - Autonomous Property System

A **fully autonomous, maintenance-free** property registry system for Costa Rica real estate. Deployed on IPFS with $0 ongoing costs, featuring automated property scraping, serverless PDF generation, and automated email campaigns.

**Status**: ✅ Production Ready | 402+ Real Properties | Last Updated: December 10, 2025

## 📚 Quick Navigation

- 🚀 **[Getting Started](#quick-start)** - Setup & deployment
- 🏗️ **[Architecture](#architecture)** - System design & tech stack
- 🔧 **[Configuration](#configuration)** - Setup instructions
- 🎯 **[Development](#development)** - Local development workflow
- 📖 **[Full Documentation](#documentation)** - Detailed guides

---

## 🚀 Key Features

- ✅ **Autonomous Property Scraping** (every 6 hours via GitHub Actions)
- ✅ **6 Active Data Sources** (Encuentra24, Craigslist, OmniMLS, Coldwell Banker, RE/MAX, Immo)
- ✅ **Real-Time Price Tracking** (detects price changes & trends)
- ✅ **Government Data Enrichment** (BCCR, Registro Nacional, municipal data - framework ready)
- ✅ **Automated Email Campaigns** (category-based to subscribers)
- ✅ **Serverless PDF Generation** (AWS Lambda)
- ✅ **IPFS Static Hosting** (decentralized, censorship-resistant)
- ✅ **PayPal + Blockchain Payments** (Polygon USDC support)
- ✅ **99.9% Uptime** (via IPFS keepalive daemon)

---

## 🎯 Zero-Cost Architecture

This system runs **completely autonomously** on free/freemium services:

| Service | Cost | Usage |
|---------|------|-------|
| GitHub Actions | $0/month | 2000 min/month (scraping, building, deploying) |
| AWS Lambda | $0/month | 1M requests/month (PDF generation) |
| IPFS Hosting | $0/month | Decentralized static site |
| EmailJS | $0/month | 200 emails/month |
| GitHub Database | $0/month | Unlimited JSON files |
| **TOTAL** | **$0/month** | ✅ Fully autonomous |

---

## 🏗️ Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                      AUTOMATION LAYER                       │
│         (GitHub Actions - Every 6 Hours)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Property Scraping     →  Deduplication  →  Enrichment    │
│  ├─ Encuentra24            SHA-256 hash      ├─ BCCR data  │
│  ├─ Craigslist            Stored: active      ├─ Property   │
│  ├─ OmniMLS                       pending      │  records    │
│  ├─ Coldwell Banker                sold        ├─ Tax data   │
│  ├─ RE/MAX                       archived      └─ Risk data  │
│  └─ Immo                                                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Email Campaigns  →  Database Commit  →  IPFS Deploy       │
│  Category-based       GitHub JSON         Web + Pinata      │
│  PDF attachments      Version control     Keepalive daemon  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          ↓
    ┌──────────────────────────────────────┐
    │    FRONTEND (React SPA on IPFS)      │
    ├──────────────────────────────────────┤
    │  • Property Search & Filtering       │
    │  • Price History Charts              │
    │  • Premium Report Generation         │
    │  • PayPal & Crypto Payments          │
    │  • Email Subscription Management     │
    └──────────────────────────────────────┘
```

### Technology Stack

**Frontend**: React 18 + TypeScript + Vite  
**Database**: GitHub JSON files (version-controlled, free)  
**Scraping**: Node.js + Puppeteer (for JavaScript-heavy sites)  
**Enrichment**: API integration framework (BCCR, Registro Nacional, etc.)  
**Hosting**: IPFS (decentralized) + Pinata (pinning service)  
**Automation**: GitHub Actions (CI/CD)  
**Monitoring**: Winston logging + structured JSON output  
**Testing**: Jest + integration tests  
**Code Quality**: ESLint + Prettier + TypeScript strict mode  

---

## 📁 Project Structure

```
CR_MLS_New/
├── .github/workflows/          # GitHub Actions automation
│   └── autonomous-mls.yml      # Main scrape → enrich → deploy pipeline
├── client/                     # React SPA for IPFS deployment
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API clients (GitHub Database)
│   │   ├── contexts/           # React Context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/              # Encryption, validation
│   ├── public/
│   │   └── database/           # Synced property data
│   ├── dist/                   # Production build
│   └── package.json
├── database/                   # JSON database files (GitHub-stored)
│   ├── properties/
│   │   ├── active.json         # Current listings (402 properties)
│   │   ├── pending.json        # Awaiting approval
│   │   ├── sold.json           # Historical sales
│   │   └── archived.json       # Old/expired
│   ├── scraping/
│   │   ├── sources.json        # 6 active sources config
│   │   ├── last-run.json       # Latest scraping stats
│   │   └── errors.json         # Error history
│   ├── config/
│   │   ├── categories.json     # Property types & pricing
│   │   ├── regions.json        # Costa Rica zones
│   │   └── automation.json     # Email settings
│   ├── subscribers/            # Email subscribers
│   ├── price-history.json      # Price tracking data
│   └── deployments/            # IPFS deployment history
├── scripts/                    # Node.js automation & utilities
│   ├── scraper.js              # Multi-source property scraper
│   ├── validate-properties.js  # Data validation & sanitization
│   ├── property-purger.js      # 90-day cleanup (runs weekly)
│   ├── email-campaigns.js      # Automated email sender
│   ├── real-data-pipeline.js   # Full enrichment pipeline
│   ├── sync-database-to-client.sh  # Dev helper
│   ├── recovery.js             # Error recovery procedures
│   └── [15+ test & debug scripts]
├── src/                        # Backend utilities & enrichment
│   ├── config.ts               # Configuration management
│   ├── types.ts                # TypeScript interfaces
│   ├── sources/                # Individual scrapers
│   ├── services/               # Business logic
│   ├── enrich/                 # Enrichment pipeline (BCCR, etc.)
│   └── utils/                  # Logger, HTTP client, helpers
├── serverless/                 # AWS Lambda functions
│   └── pdf-generator/          # PDF report generation
├── contracts/                  # Polygon smart contracts
│   └── PropertyEscrow.sol       # Crypto payment handling
├── logs/                       # Pipeline execution logs
├── public/                     # Static files
│   └── pdfs/                   # Generated PDF reports
├── .husky/                     # Git hooks (pre-commit)
├── tsconfig.json               # TypeScript configuration (strict mode)
├── .prettierrc.json            # Code formatting rules
├── .eslintrc.json              # Linting rules
├── jest.config.js              # Testing configuration
├── CODEOWNERS                  # Code ownership & approvals
└── [Documentation files below]
```

---

## 🔧 Configuration

### Database Configuration Files

**`database/config/categories.json`** - Property types & pricing
```json
{
  "residential": { "name": "Residential", "email_price": 5, "auto_email": true },
  "commercial": { "name": "Commercial", "email_price": 12, "auto_email": true },
  "land": { "name": "Land", "email_price": 8, "auto_email": true },
  "luxury": { "name": "Luxury", "email_price": 15, "auto_email": true }
}
```

**`database/scraping/sources.json`** - Active property sources
- Encuentra24 (primary API)
- Craigslist (RSS + scraping)
- OmniMLS (with Costa Rica filtering)
- Coldwell Banker CR
- RE/MAX Costa Rica
- Immo Costa Rica

**`database/config/automation.json`** - Email & scraping schedule
- Scraping: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- Purging: Weekly Sundays at 2 AM UTC
- Email: After each scraping cycle

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Git
- IPFS daemon (optional, for local deployment)

### 2. Clone & Setup
```bash
git clone https://github.com/urmt/CR_MLS.git
cd CR_MLS_New
npm install
cd client && npm install && cd ..
```

### 3. Set GitHub Secrets
Go to: https://github.com/urmt/CR_MLS/settings/secrets/actions

Add these secrets:
```
PINATA_API_KEY=<your-pinata-key>
PINATA_SECRET=<your-pinata-secret>
EMAILJS_SERVICE_ID=<your-emailjs-service>
EMAILJS_TEMPLATE_ID=<your-emailjs-template>
EMAILJS_PUBLIC_KEY=<your-emailjs-key>
```

⚠️ **IMPORTANT**: Never commit API keys. Always use GitHub Secrets.

### 4. Local Development
```bash
# Pull latest scraped data
git pull origin main

# Sync database to client
./scripts/sync-database-to-client.sh

# Start dev server
cd client && npm run dev
# Opens on http://localhost:5173
```

### 5. Run Validation & Tests
```bash
npm run validate    # Check property data integrity
npm run test        # Run unit tests
npm test:integration  # Run integration tests
npm run lint        # Check code quality
npm run format      # Auto-format code
```

### 6. Manual Scraping (if needed)
```bash
node scripts/scraper.js        # Scrape all sources
node scripts/property-purger.js  # Clean 90+ day old properties
npm run validate               # Verify data
git add database/ && git commit -m "Manual property update"
```

---

## 🔄 Automation Workflows

### GitHub Actions Automation (Every 6 Hours)

The `.github/workflows/autonomous-mls.yml` workflow runs:

1. **Property Scraping** (10-20 minutes)
   - Scrapes all 6 active sources in parallel
   - Deduplicates properties
   - Stores in `database/properties/pending.json`

2. **Approval & Move** (automatic)
   - Moves pending → active properties
   - Commits to GitHub

3. **Property Purging** (Sundays only)
   - Removes properties 90+ days old
   - Cleans up database

4. **Email Campaigns**
   - Sends new listings to subscribers
   - Category-based distribution
   - PDF attachments via AWS Lambda

5. **IPFS Deployment**
   - Builds React client
   - Deploys to local IPFS node
   - Pins to Pinata
   - Announces to DHT

### Manual Workflow Triggers
```bash
# Trigger scraping only
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=scrape

# Trigger full workflow
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=full

# Check recent runs
gh run list --workflow="autonomous-mls.yml" --repo urmt/CR_MLS
```

---

## 🧪 Development

### Code Quality Standards

All commits must pass:
```bash
npm run lint        # ESLint - no errors allowed
npm run format      # Prettier - consistent formatting
npm run type-check  # TypeScript - strict mode (no `any`)
npm test           # Jest - all tests must pass
npm run validate   # Property data integrity
```

### Pre-commit Hooks

The project uses Husky to prevent bad commits:
- ❌ Detects exposed API keys
- ❌ Rejects commits to main/master
- ✅ Auto-runs ESLint on staged files
- ✅ Checks file sizes (warn >10MB)

### Adding New Property Sources

1. **Create scraper** in `src/sources/newsource.ts`
2. **Add configuration** to `database/scraping/sources.json`
3. **Test scraper** with: `node scripts/test-single-source.js newsource`
4. **Update documentation** in `README-OMNIMLS.md` template
5. **Submit PR** for review

### Testing

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Integration tests only
npm run test:integration

# Run specific test file
npm test -- scripts/scraper.test.js
```

---

## 📖 Documentation

### Main Guides
- **[START-HERE.md](./START-HERE.md)** - Current status & next steps ⭐ **START HERE**
- **[WARP.md](./WARP.md)** - Technical architecture & APIs
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - Current deployment details
- **[PROJECT-LOG.md](./PROJECT-LOG.md)** - Development history & milestones

### Integration Guides
- **[README-OMNIMLS.md](./README-OMNIMLS.md)** - OmniMLS scraper integration
- **[README-REAL-DATA.md](./README-REAL-DATA.md)** - Government API enrichment
- **[database/README.md](./database/README.md)** - Database structure

### Additional Resources
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development guidelines
- **[SECURITY.md](./SECURITY.md)** - Security policies & secret management
- **[API-KEYS.md](./API-KEYS.md)** - How to obtain API credentials

---

## 🔐 Security

- **Pre-commit hooks** prevent accidental credential commits
- **GitHub Secrets** for all sensitive credentials (never in code)
- **Client-side encryption** for stored credentials (CryptoJS)
- **AWS IAM roles** restrict Lambda function permissions
- **PayPal sandbox mode** for development

### Credential Rotation
GitHub API keys should be rotated every 90 days:
1. Generate new credentials in provider dashboard
2. Update GitHub Secrets
3. Delete old credentials
4. Verify in next automated run

⚠️ **If Credentials Compromised**:
```bash
# 1. Revoke old credentials immediately
# 2. Generate new ones
# 3. Update GitHub Secrets
# 4. Run recovery procedure
git pull origin main
./scripts/recovery.js rotate-credentials
git push origin main
```

---

## 🌐 IPFS Deployment

### Live URL
- **Primary**: https://w3s.link/ipfs/[CURRENT_CID]
- **Pinata**: https://gateway.pinata.cloud/ipfs/[CURRENT_CID]
- **IPFS.io**: https://ipfs.io/ipfs/[CURRENT_CID]

Deployment history in: `database/deployments/ipfs-history.json`

### Local IPFS Setup
```bash
# Install IPFS
brew install ipfs  # macOS
# OR
sudo apt install go-ipfs  # Linux

# Initialize
ipfs init
ipfs daemon &

# Deploy locally
./scripts/deploy-ipfs.sh

# Pin to Pinata (automatic via GitHub Actions)
```

### Keepalive Daemon (Linux)
Maintains IPFS availability via systemd service:
```bash
~/.ipfs-keepalive/manage.sh status   # Check status
~/.ipfs-keepalive/manage.sh follow   # View live logs
~/.ipfs-keepalive/manage.sh restart  # Restart service
```

---

## 💰 Revenue Model

Users can access property contact information via:
- **$5**: Residential properties (PayPal/USDC)
- **$12**: Commercial properties (PayPal/USDC)
- **$15**: Luxury properties (PayPal/USDC)

Payments processed via:
- **PayPal** (direct integration)
- **Polygon USDC** (via smart contract)

---

## 🚨 Monitoring & Alerts

### Health Checks
```bash
# Check GitHub Actions status
gh run list --workflow="autonomous-mls.yml" --repo urmt/CR_MLS

# Check IPFS availability
curl https://ipfs.io/ipfs/[CID]/index.html

# Check database freshness
git log --oneline -n 10 database/properties/

# View recent logs
ls -lh logs/pipeline-*.json | tail -5
```

### Troubleshooting
- **0 properties scraped**: Check `logs/pipeline-latest.json` for errors
- **IPFS not accessible**: Verify Pinata pinning in GitHub Actions logs
- **Email not sending**: Check EmailJS credentials in GitHub Secrets
- **Data corruption**: Run `./scripts/recovery.js repair-database`

---

## 🤝 Contributing

1. **Create feature branch** (never commit to main)
2. **Make changes** following code standards
3. **Run tests**: `npm test && npm run validate`
4. **Submit PR** with description of changes
5. **Code review** before merging
6. **Deploy** to production via GitHub Actions

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

MIT License - Free to use and modify

---

## 📊 Current Status

| Component | Status | Last Update |
|-----------|--------|-------------|
| Property Scraping | ✅ Active | Runs every 6 hours |
| Database | ✅ 402 properties | Dec 10, 2025 |
| IPFS Deployment | ✅ Live | Auto-updates with scraping |
| Email Campaigns | ✅ Working | Runs after scraping |
| PDF Generation | ✅ AWS Lambda | On-demand generation |
| Code Quality | ✅ Strict TypeScript | All tests passing |
| Pre-commit Hooks | ✅ Installed | Prevents credentials leaks |

---

**🌐 This system operates autonomously with zero manual intervention required!** 🚀

Last Updated: December 10, 2025  
Questions? See [START-HERE.md](./START-HERE.md) for current status and next steps.

Visit the live site: `https://ipfs.io/ipfs/[your-hash]`