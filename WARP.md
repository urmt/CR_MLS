# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Costa Rica MLS is a **fully autonomous, maintenance-free** property registry system for Costa Rica real estate. The system is designed for **IPFS deployment with $0 ongoing costs**, featuring automated property scraping, serverless PDF generation, encrypted client-side operation, and automated email delivery of property listings by category.

**Key Innovation**: A completely serverless architecture using GitHub as a free database and IPFS for hosting, requiring zero ongoing maintenance.

## 🌐 Current Live Deployment

🚀 Permanent Automated IPFS URL**: https://w3s.link/ipfs/QmQtRXSzSeybtj8csDr8d9HnciQHU77BWdGkmfYrYfwrFH

**🔥 NEW: Real-Data Pipeline**: Fully automated system for gathering **real property listings** from Costa Rica sources with government data enrichment.

**Alternative Gateways**:
- https://ipfs.io/ipfs/QmQtRXSzSeybtj8csDr8d9HnciQHU77BWdGkmfYrYfwrFH
- https://gateway.ipfs.io/ipfs/QmQtRXSzSeybtj8csDr8d9HnciQHU77BWdGkmfYrYfwrFH
- https://dweb.link/ipfs/QmQtRXSzSeybtj8csDr8d9HnciQHU77BWdGkmfYrYfwrFH

✅ Status**: Fully operational with **122+ real properties**, working PayPal payments, automated scraping pipeline, and comprehensive data enrichment system.

🤖 Auto-Updates**: Every 6 hours via **Real-Data Pipeline** - scrapes Encuentra24 & Craigslist, enriches with BCCR/government data, generates PDFs, and deploys to IPFS.

## 🔄 Automation Status

## 🇨🇷 Real-Data Pipeline (NEW)

### **Automated Property Data Collection & Enrichment**

The system now includes a **fully autonomous real-data pipeline** that:

#### **Data Sources**
- **Encuentra24** (~80% of Costa Rica listings) - API integration
- **Craigslist** (~15% expat market) - RSS + web scraping
- **Future**: Lamudi and additional MLS systems

#### **Data Enrichment** 
Each property is automatically enriched with:
- **BCCR Data**: Exchange rates, housing price index, mortgage rates
- **Registro Nacional**: Property ownership, cadastral numbers, title status
- **Municipal Tax**: Property taxes, cadastral values, luxury tax status
- **MOPT Flood Risk**: Government flood zone assessments
- **School Proximity**: Distance to public/private schools
- **Energy Certification**: MINAE green building certifications
- **Market Analysis**: Price trends, comparable sales, ROI projections

#### **Pipeline Commands**
```bash
# Run real-data pipeline (requires API credentials)
node scripts/real-data-pipeline.js

# Check pipeline logs
ls logs/pipeline-*.json

# Sync database from GitHub to local client
cp -r database/* client/public/database/
```

#### **API Credentials Required** 
- **BCCR_API_USER** / **BCCR_API_PASS** - Central Bank API
- **REGISTRO_NACIONAL_CERT** / **REGISTRO_NACIONAL_TOKEN** - Property Registry
- **Municipal tokens** for San José, Escazú, Santa Ana (optional)

*See `README-REAL-DATA.md` for complete setup instructions.*

### ✅ Fully Automated Processes
- **Property Scraping**: Every 6 hours from real estate agent websites
- **Database Updates**: GitHub JSON files updated automatically
- **IPFS Deployment**: Fresh deployment with latest properties every 6 hours
- **Email Campaigns**: Sent after each scraping cycle
- **Property Purging**: 90-day cleanup runs weekly on Sundays
- **Data Validation**: Duplicate detection and removal

### 🛠️ Manual Triggers Available
```bash
# Trigger full automation workflow
gh workflow run "Autonomous Costa Rica MLS" --field action=full

# Individual components
gh workflow run "Autonomous Costa Rica MLS" --field action=scrape
gh workflow run "Autonomous Costa Rica MLS" --field action=purge
gh workflow run "Autonomous Costa Rica MLS" --field action=email
gh workflow run "Autonomous Costa Rica MLS" --field action=deploy
```

## 🚀 Autonomous IPFS Deployment Commands

### IPFS Static Deployment (Production)
```bash
# Sync latest GitHub database to local deployment files
./scripts/sync-database.sh

# Build and deploy to IPFS (fully autonomous)
./scripts/deploy-ipfs.sh

# Deploy serverless functions
./scripts/deploy-lambda.sh

# Manual property scraping (runs automatically via GitHub Actions)
node scripts/scraper.js

# Property purging (90-day cleanup)
node scripts/property-purger.js

# Send email campaigns (runs automatically)
node scripts/email-campaigns.js
```

### Client Development (React SPA)
```bash
# Development (from /client directory)
npm install
npm run dev          # Vite dev server on port 5173
npm run build        # TypeScript compilation + Vite build
npm run lint         # ESLint with auto-fix
npm run preview      # Preview production build

# Root-level development
npm run start        # Docker Compose full stack (if server exists)
npm run stop         # Stop Docker containers
npm run clean        # Clean Docker resources
```

### Development Workflow (Important!)
```bash
# 1. Pull latest scraped data from GitHub
git pull origin main

# 2. Sync database to client (REQUIRED for dev server)
./scripts/sync-database-to-client.sh

# 3. Start development server
cd client && npm run dev

# The client will now show all 122+ real properties from the scraped database
```

### GitHub Database Management
```bash
# The database is stored as JSON files in GitHub repository
# Data fetched client-side from: 
# https://raw.githubusercontent.com/urmt/CR_MLS/main/database/

# Property data updates automatically via GitHub Actions every 6 hours
# Email campaigns run after each scraping cycle
# Old properties purged weekly on Sundays
```

## 🏠 Autonomous Architecture

### 🔥 Core Innovation: $0 Maintenance System
This system is designed to run **completely autonomously** on IPFS with:
- 🆓 **Free GitHub Database** (JSON files + Actions)
- 🆓 **Free IPFS Hosting** (decentralized static site)
- 🆓 **Free GitHub Actions** (2000 minutes/month for scraping)
- 🆓 **Free AWS Lambda** (1M requests/month for PDF generation)
- 🆓 **Free EmailJS** (200 emails/month)

### Project Structure
```
CR_MLS_New/
├── client/              # React 18 + TypeScript SPA
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React Context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route components
│   │   ├── services/    # API services (GitHub Database)
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions (encryption)
│   ├── dist/           # Built static files for deployment
│   └── package.json    # Client dependencies
├── database/           # JSON database files
│   ├── properties/     # Active, pending, sold properties
│   ├── subscribers/    # Email subscription data
│   ├── scraping/       # Scraper configuration
│   └── config/         # System configuration
├── scripts/            # Node.js automation scripts
├── serverless/         # AWS Lambda functions
├── contracts/          # Polygon smart contracts
└── package.json        # Workspace configuration
```

### Tech Stack

#### Frontend (Client-Side Only)
- **React 18 + TypeScript** with Vite build system
- **TanStack Query** for server state management with caching
- **React Router** for client-side routing
- **GitHub Database Service** for fetching property data
- **Encrypted Key Management** (CryptoJS client-side encryption)
- **PayPal Client SDK** for direct payment processing
- **EmailJS** for client-side email integration
- **Radix UI** components for accessible UI elements
- **Chart.js** for data visualization
- **React Hook Form + Zod** for form validation

#### Backend (Serverless Only)
- **GitHub Actions** for automated property scraping
- **AWS Lambda** for PDF generation (Puppeteer + S3)
- **EmailJS API** for automated email campaigns
- **Polygon Smart Contract** for payment escrow
- **Node.js scripts** for scraping and email automation

#### Infrastructure
- **GitHub Repository** as free JSON database
- **IPFS Network** for decentralized hosting
- **AWS S3** for PDF storage (pay-per-use)
- **GitHub Actions** for automated workflows

### Key Architectural Patterns

#### Frontend Architecture
- **Static SPA Pattern**: No backend server, all data from GitHub API
- **Query Client Pattern**: TanStack Query for server state with 5min cache
- **Service Layer Pattern**: GitHubDatabaseService for data access
- **Encryption Pattern**: Client-side credential encryption with CryptoJS
- **Form Validation**: React Hook Form integrated with Zod schemas
- **Component Composition**: Radix UI primitives with custom styling

#### Data Management
- **GitHub as Database**: JSON files in `/database` directory
- **Client-Side Caching**: TanStack Query + GitHubDatabaseService cache
- **Real-Time Updates**: Manual refresh or timed cache invalidation
- **Offline Support**: Cached data available when GitHub is unreachable

#### Database Schema (JSON Files)
- **Property Model** (`/database/properties/active.json`):
  ```typescript
  interface Property {
    id: string;
    title: string;
    price_usd: number;
    price_text: string;
    location: string;
    description?: string;
    images: string[];
    url?: string;
    source: string;
    category: string;
    scraped_at: string;
  }
  ```
- **Category Config** (`/database/config/categories.json`):
  ```typescript
  interface CategoryConfig {
    name: string;
    subcategories: string[];
    email_price: number;
    pdf_template: string;
    auto_email: boolean;
    frequency: string;
  }
  ```
- **Scraping Sources** (`/database/scraping/sources.json`):
  ```typescript
  interface ScrapingSource {
    name: string;
    base_url: string;
    endpoints: Record<string, string>;
    selectors: Record<string, string>;
    active: boolean;
    scrape_frequency: string;
    max_pages: number;
  }
  ```

#### Blockchain Integration
- **Polygon Network**: USDC-based property listing payments
- **Smart Contract**: `PropertyEscrow.sol` handles both crypto and fiat payments
- **Dual Payment System**: Crypto payments direct to contract, fiat via backend

### API Integration Patterns

#### GitHub Database API
- **Raw Content API**: `https://raw.githubusercontent.com/urmt/CR_MLS/main/database/`
- **Caching Strategy**: 5-minute client-side cache with fallback to expired data
- **Error Handling**: Graceful degradation when GitHub is unavailable
- **Rate Limiting**: Built-in via GitHub's CDN

#### External Services
- **PayPal**: Direct PayPal SDK integration for immediate payment popups
- **EmailJS**: Client-side email sending without backend
- **AWS Lambda**: PDF generation via serverless functions
- **IPFS**: Content-addressed storage for static hosting

### 💰 Paid Report System

The system offers three premium report types with secure payment integration:

#### 1. Contact Information ($5-$15)
- **Content**: Agent details, phone, email, office, WhatsApp, licenses
- **Images**: Up to 10 property images with clickable links
- **Format**: Professional HTML email template
- **Price**: Variable by property category (luxury = $15, standard = $5)

#### 2. CR Legal Concessions ($12)
- **Content**: Maritime zone status, beach access rights, permits
- **Details**: Environmental compliance, building restrictions
- **Legal**: Tax status, concession numbers, expiration dates
- **Price**: Fixed $12 per report

#### 3. Property History ($8)
- **Content**: Price history, ownership records, market analysis
- **Timeline**: Previous listings, price changes, days on market
- **Investment**: Rental history and ROI analysis
- **Price**: Fixed $8 per report

#### Payment Integration
- **PayPal**: Direct popup payments (no modal required)
- **Crypto**: QR code with auto-scroll for mobile/desktop
- **Security**: Source information hidden until payment
- **Delivery**: Instant email delivery with HTML formatting

### Development Environment

#### Port Configuration
- **Frontend**: 5173 (Vite dev server, configurable)
- **Preview**: 4173 (Vite preview server)

#### Development Tools
- **Build System**: Vite 5.0+ with TypeScript support
- **Hot Reload**: Vite HMR with React Fast Refresh
- **Linting**: ESLint with TypeScript parser and React plugins
- **Type Checking**: TypeScript 5.0+ with strict mode
- **Package Manager**: npm (workspace configuration in root)

#### Environment Variables (Development)
```bash
# Client environment variables (prefix with VITE_)
VITE_MASTER_KEY=your-encryption-master-key
VITE_EMAILJS_SERVICE_ID=encrypted-service-id
VITE_EMAILJS_TEMPLATE_ID=encrypted-template-id
VITE_EMAILJS_PUBLIC_KEY=encrypted-public-key
VITE_PAYPAL_CLIENT_ID=encrypted-client-id
VITE_AWS_LAMBDA_PDF_URL=encrypted-lambda-url
VITE_GITHUB_RAW_URL=https://raw.githubusercontent.com/urmt/CR_MLS/main/database
```

### Security Considerations
- **Client-Side Encryption**: All API keys encrypted with CryptoJS before localStorage
- **Environment Variables**: Vite environment variables for build-time configuration
- **No Backend**: Eliminates server-side attack vectors
- **GitHub API**: Read-only access to public repository data
- **PayPal Sandbox**: Development environment for payment testing
- **HTTPS Only**: All external API calls use HTTPS

### Testing and Quality
- **TypeScript**: Strict type checking prevents runtime errors
- **ESLint**: Code quality and consistency enforcement
- **React Fast Refresh**: Instant feedback during development
- **Build Validation**: TypeScript compilation errors prevent deployment
