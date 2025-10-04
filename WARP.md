# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Costa Rica MLS is a **fully autonomous, maintenance-free** property registry system for Costa Rica real estate. The system is designed for **IPFS deployment with $0 ongoing costs**, featuring automated property scraping, serverless PDF generation, encrypted client-side operation, and automated email delivery of property listings by category.

## 🚀 Autonomous IPFS Deployment Commands

### IPFS Static Deployment (Production)
```bash
# Build and deploy to IPFS (fully autonomous)
./scripts/deploy-ipfs.sh

# Deploy serverless functions
./scripts/deploy-lambda.sh

# Manual property scraping (runs automatically via GitHub Actions)
node scripts/scraper.js

# Send email campaigns (runs automatically)
node scripts/email-campaigns.js
```

### Client Development (Static React App)
```bash
cd client
npm install
npm run dev          # Development server on port 3000
npm run build        # Static build for IPFS deployment
npm run preview      # Preview static build
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
- **client/**: Static React SPA for IPFS deployment
- **database/**: JSON-based database stored in GitHub
- **scripts/**: Automated scraping and email campaigns
- **serverless/**: AWS Lambda functions (PDF generation, payment processing)
- **contracts/**: Polygon smart contracts for payments
- **.github/workflows/**: Automated CI/CD and data management

### Tech Stack

#### Frontend (Client-Side Only)
- **React 18** static build deployed to IPFS
- **GitHub Database Service** for fetching property data
- **Encrypted Key Management** (CryptoJS client-side encryption)
- **PayPal Client SDK** for direct payment processing
- **EmailJS** for client-side email integration
- **Web3.js** for blockchain interactions

#### Backend (Serverless Only)
- **GitHub Actions** for automated property scraping
- **AWS Lambda** for PDF generation (Puppeteer + S3)
- **EmailJS API** for automated email campaigns
- **Polygon Smart Contract** for payment escrow

#### Infrastructure
- **GitHub Repository** as free JSON database
- **IPFS Network** for decentralized hosting
- **AWS S3** for PDF storage (pay-per-use)
- **GitHub Actions** for automated workflows

### Key Architectural Patterns

#### Frontend Architecture
- **Provider Pattern**: AuthContext for global authentication state
- **Query Client Pattern**: TanStack Query for server state with caching
- **Layout Components**: Nested routing with shared layout components
- **Form Validation**: React Hook Form integrated with Zod schemas

#### Backend Architecture
- **MVC Pattern**: Controllers, models, and routes separation
- **Middleware Chain**: Authentication, error handling, and logging
- **Service Layer**: External API integrations (PayPal, government APIs)
- **Configuration Management**: Centralized config with environment variables

#### Database Schema
- **User Model**: Agent authentication with role-based access
- **Property Model**: Complex schema with Costa Rican legal requirements
  - `legalDetails.folioReal`: National Registry ID
  - `concessionType`: Beach/navigable water concessions
  - `municipalPermits`: Local government approvals
- **Payment Model**: Transaction tracking for contact access fees

#### Blockchain Integration
- **Polygon Network**: USDC-based property listing payments
- **Smart Contract**: `PropertyEscrow.sol` handles both crypto and fiat payments
- **Dual Payment System**: Crypto payments direct to contract, fiat via backend

### API Integration Patterns

#### Costa Rican Government APIs
- **Registro Nacional**: Property ownership verification via `folioReal`
- **MINAE**: Environmental restrictions and concessions
- **Municipal Systems**: Zoning and permit validation

#### PayPal Integration
- **Frontend**: `@paypal/react-paypal-js` for payment UI
- **Backend**: Server SDK for payment processing and webhooks
- **Serverless**: Converter function for crypto/fiat payment bridging

### Development Environment

#### Port Configuration
- **Frontend**: 3000 (Vite dev server with API proxy)
- **Backend**: 5000 (Express server)
- **MongoDB**: 27017 (Docker container)

#### Hot Reload Setup
- **Client**: Vite HMR with React Fast Refresh
- **Server**: tsc-watch for TypeScript compilation and restart
- **Docker**: Volume mounts for live code updates

### Security Considerations
- **JWT Authentication**: Secure token-based auth with bcrypt hashing
- **Environment Variables**: Sensitive data in .env files (not committed)
- **CORS Configuration**: Proper origin handling for API access
- **Helmet Middleware**: Security headers for Express endpoints
- **PayPal Sandbox**: Development environment for payment testing