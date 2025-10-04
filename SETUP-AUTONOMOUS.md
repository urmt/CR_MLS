# 🚀 Costa Rica MLS - Autonomous IPFS Setup Guide

This guide will help you deploy a **fully autonomous, maintenance-free** Costa Rica MLS system on IPFS with $0 ongoing costs.

## 🎯 What You'll Get

- ✅ **Autonomous Property Scraping** (every 6 hours via GitHub Actions)
- ✅ **Automated Email Campaigns** (PDF property listings sent by category)
- ✅ **Serverless PDF Generation** (AWS Lambda with secure storage)
- ✅ **IPFS Static Hosting** (decentralized, maintenance-free)
- ✅ **Encrypted API Keys** (client-side security)
- ✅ **PayPal Integration** (direct client payments)
- ✅ **Blockchain Payments** (Polygon USDC support)

## 📋 Prerequisites

### Required Accounts (All Free Tiers)
1. **GitHub Account** (for database and CI/CD)
2. **EmailJS Account** (for email campaigns)
3. **AWS Account** (for Lambda PDF generation)
4. **PayPal Developer Account** (for payments)

### Optional
- **Pinata Account** (for IPFS pinning service)
- **Polygon Wallet** (for crypto payments)

## 🛠️ Step-by-Step Setup

### Step 1: EmailJS Configuration

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create a new service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   ```
   {{to_name}}, {{subject}}, {{category_name}}, 
   {{property_count}}, {{properties_summary}}, {{pdf_url}}
   ```
4. Note down:
   - Service ID
   - Template ID
   - Public Key

### Step 2: AWS Lambda Setup

1. Deploy the PDF generator function:
   ```bash
   cd serverless
   # Update environment variables
   ./deploy-lambda.sh
   ```

2. Create S3 bucket for PDF storage:
   ```bash
   aws s3 mb s3://cr-mls-pdfs
   ```

3. Note down the Lambda function URL

### Step 3: GitHub Secrets Configuration

Add these secrets to your GitHub repository:

```bash
# Required Secrets
ENCRYPTION_KEY=your-32-char-encryption-key
EMAILJS_SERVICE_ID=your-service-id
EMAILJS_TEMPLATE_ID=your-template-id
EMAILJS_PUBLIC_KEY=your-public-key
AWS_LAMBDA_PDF_URL=your-lambda-function-url

# Optional (for crypto payments)
PAYPAL_CLIENT_ID=your-paypal-client-id
POLYGON_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=your-deployed-contract-address
```

### Step 4: Initialize Database Structure

Create initial database files in your repository:

```bash
# Run this once to set up the database structure
mkdir -p database/{properties,subscribers,scraping,config,email-campaigns}

# Copy the configuration files
cp database/config/categories.json database/config/categories.json
cp database/scraping/sources.json database/scraping/sources.json
```

### Step 5: Deploy to IPFS

```bash
# Build the static client
cd client
npm install
npm run build

# Deploy to IPFS
cd ..
./scripts/deploy-ipfs.sh
```

### Step 6: Set Up Automated Workflows

The GitHub Actions workflows will automatically:
- ✅ Scrape properties every 6 hours
- ✅ Send email campaigns after scraping
- ✅ Purge old properties weekly
- ✅ Update IPFS deployment

## 🔐 Security Setup

### Client-Side Key Encryption

The system uses client-side encryption for all sensitive keys:

```typescript
// Keys are encrypted and stored in localStorage
const encryptionManager = new EncryptionManager();
encryptionManager.storeCredentials({
  emailjs: { serviceId: "...", templateId: "...", publicKey: "..." },
  paypal: { clientId: "..." },
  aws: { lambdaPdfUrl: "..." }
});
```

### Environment Variables

Set these in your deployment environment:

```bash
# .env (for development)
REACT_APP_MASTER_KEY=your-encryption-master-key
REACT_APP_EMAILJS_SERVICE_ID=encrypted-service-id
REACT_APP_EMAILJS_TEMPLATE_ID=encrypted-template-id
REACT_APP_EMAILJS_PUBLIC_KEY=encrypted-public-key
REACT_APP_PAYPAL_CLIENT_ID=encrypted-client-id
REACT_APP_AWS_LAMBDA_PDF_URL=encrypted-lambda-url
```

## 📊 Monitoring & Maintenance

### Automated Monitoring

The system monitors itself and sends alerts via:
- **GitHub Actions logs** for scraping status
- **AWS CloudWatch** for Lambda function health
- **EmailJS dashboard** for email delivery stats

### Manual Maintenance (Rarely Needed)

```bash
# Check scraping status
cat database/scraping/last-run.json

# Check email campaign results  
cat database/email-campaigns/last-run.json

# Manual property scraping
node scripts/scraper.js

# Manual email campaign
node scripts/email-campaigns.js

# Redeploy to IPFS
./scripts/deploy-ipfs.sh
```

## 🎯 Usage

### For Property Seekers
1. Visit your IPFS-hosted website
2. Browse properties by category, location, price
3. Pay $5-15 via PayPal or crypto to access contact info
4. Receive PDF property listing via email

### For Email Subscribers  
1. Users can subscribe to categories (residential, commercial, land, luxury)
2. Automated emails sent with new properties in their category
3. PDF attachments with property details

### For Property Agents
1. Properties are automatically scraped from Costa Rica sources
2. Manual property additions via GitHub (add to pending.json)
3. Properties auto-categorized and distributed

## 🚨 Troubleshooting

### Common Issues

1. **Scraping not working**
   - Check GitHub Actions logs
   - Verify selectors in `database/scraping/sources.json`
   - Costa Rica sites may have changed structure

2. **Emails not sending**
   - Check EmailJS dashboard
   - Verify template variables
   - Check monthly email limits

3. **PDF generation failing**
   - Check AWS Lambda logs
   - Verify S3 bucket permissions
   - Check Lambda timeout settings

4. **IPFS deployment issues**
   - Ensure IPFS daemon is running
   - Check pinning service status
   - Verify build directory exists

### Support

- **GitHub Issues**: Report bugs and feature requests
- **Email**: Contact via generated property PDFs
- **Documentation**: See `WARP.md` for technical details

## 💰 Cost Breakdown

### Free Tier Limits
- **GitHub Actions**: 2000 minutes/month (sufficient for 24/7 operation)
- **AWS Lambda**: 1M requests + 400,000 GB-seconds/month
- **EmailJS**: 200 emails/month
- **IPFS Hosting**: Free (decentralized)
- **GitHub Database**: Unlimited for public repos

### Estimated Usage
- **Property Scraping**: ~50 minutes/month
- **PDF Generation**: ~100 requests/month  
- **Email Campaigns**: ~50 emails/month
- **IPFS Storage**: ~500MB

**Total Monthly Cost: $0** ✅

## 🎉 Go Live!

Once setup is complete, your system will:

1. ✅ **Auto-scrape** Costa Rica property sites every 6 hours
2. ✅ **Auto-categorize** properties (residential, commercial, land, luxury)  
3. ✅ **Auto-generate** PDF listings with property details
4. ✅ **Auto-email** subscribers with new properties in their categories
5. ✅ **Auto-purge** old/expired listings weekly
6. ✅ **Auto-deploy** updates to IPFS network

**Your Costa Rica MLS is now fully autonomous and maintenance-free!** 🚀