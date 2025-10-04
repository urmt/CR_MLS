# 🏠 Costa Rica MLS - Autonomous Property System

A **fully autonomous, maintenance-free** property registry system for Costa Rica real estate. Deployed on IPFS with $0 ongoing costs, featuring automated property scraping, serverless PDF generation, and automated email campaigns.

## 🚀 Key Features

- ✅ **Autonomous Property Scraping** (every 6 hours via GitHub Actions)
- ✅ **Automated Email Campaigns** (PDF property listings sent by category)
- ✅ **Serverless PDF Generation** (AWS Lambda with secure storage)
- ✅ **IPFS Static Hosting** (decentralized, maintenance-free)
- ✅ **Encrypted API Keys** (client-side security)
- ✅ **PayPal Integration** (direct client payments)
- ✅ **Blockchain Payments** (Polygon USDC support)

## 🎯 Zero-Cost Architecture

This system runs completely autonomously using free tiers:

- 🆓 **GitHub Actions** (2000 minutes/month for scraping)
- 🆓 **AWS Lambda** (1M requests/month for PDF generation)  
- 🆓 **EmailJS** (200 emails/month)
- 🆓 **IPFS Hosting** (decentralized static site)
- 🆓 **GitHub Database** (JSON files as database)

**Total Monthly Cost: $0** ✅

## 📁 Project Structure

```
CR_MLS/
├── 🤖 .github/workflows/     # Automated scraping & email campaigns
├── 🏠 client/               # React app for IPFS deployment
├── 🗄️ database/             # JSON database files
├── ⚡ serverless/           # AWS Lambda functions  
├── 🔧 scripts/             # Deployment & automation scripts
├── 📄 contracts/           # Polygon smart contracts
└── 📖 docs/                # Setup & deployment guides
```

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone [your-repo-url]
cd CR_MLS
```

### 2. Configure EmailJS
- Create EmailJS account
- Add Service ID, Template ID, Public Key to GitHub Secrets

### 3. Deploy Serverless Functions
```bash
cd serverless
./deploy-lambda.sh  # Deploy PDF generator to AWS
```

### 4. Deploy to IPFS
```bash
cd client
npm install
npm run build
cd ..
./scripts/deploy-ipfs.sh
```

## 📊 System Status

- **🤖 Property Scraping**: Every 6 hours automatically
- **📧 Email Campaigns**: After each scraping cycle
- **🗄️ Database Updates**: Real-time via GitHub
- **🌐 IPFS Deployment**: Automatic with updates

## 🔧 Configuration

All configuration is stored in JSON files:

- `database/config/categories.json` - Property categories & pricing
- `database/scraping/sources.json` - Costa Rica property sources
- `database/subscribers/by-category.json` - Email subscribers

## 📈 Property Sources

Currently scraping from:
- **Encuentra24 Costa Rica** (houses, condos, land, commercial)
- **Lamudi Costa Rica** (buy/rent listings)
- **Craigslist Costa Rica** (real estate section)

## 💰 Revenue Model

- **Contact Access**: $5-15 per property (PayPal or USDC)
- **Email Subscriptions**: Automated delivery by category
- **PDF Reports**: Professional property listings

## 🛠️ Development

### Local Development
```bash
cd client
npm install
npm run dev  # Starts development server
```

### Testing EmailJS
```bash
# Update credentials in scripts/test-emailjs.js
node scripts/test-emailjs.js
```

### Manual Scraping
```bash
node scripts/scraper.js
```

## 📧 Email System

Automated email campaigns with:
- **Category-based subscriptions** (residential, commercial, land, luxury)
- **Professional PDF attachments** with property details
- **Automated delivery** after each scraping cycle

## 🔐 Security

- **Client-side encryption** for API keys (CryptoJS)
- **GitHub Secrets** for CI/CD credentials  
- **AWS IAM roles** for Lambda functions
- **PayPal sandbox** for development

## 📚 Documentation

- [`SETUP-AUTONOMOUS.md`](./SETUP-AUTONOMOUS.md) - Complete setup guide
- [`WARP.md`](./WARP.md) - Technical architecture details
- [`database/README.md`](./database/README.md) - Database structure

## 🤝 Contributing

This is an autonomous system, but contributions welcome:
1. Fork the repository
2. Create feature branch
3. Test with sample data
4. Submit pull request

## 📄 License

MIT License - Feel free to use and modify

---

**🌐 This system operates autonomously with zero maintenance required!** 🚀

Visit the live site: `https://ipfs.io/ipfs/[your-hash]`