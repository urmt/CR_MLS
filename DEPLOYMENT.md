# 🚀 Deployment Documentation

Complete guide for deploying and maintaining the Costa Rica MLS system.

## Table of Contents

1. [Quick Deployment](#quick-deployment)
2. [Production Checklist](#production-checklist)
3. [GitHub Actions Setup](#github-actions-setup)
4. [IPFS Deployment](#ipfs-deployment)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Quick Deployment

### Automated (Recommended)

All deployments happen automatically via GitHub Actions when you push to `main`:

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and test
npm test
npm run validate

# 3. Commit & push
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature

# 4. Create PR and merge to main
# GitHub Actions automatically:
#   - Runs tests
#   - Validates data
#   - Builds React client
#   - Deploys to IPFS
#   - Updates database

# 5. Monitor deployment
gh run list --workflow="autonomous-mls.yml" --repo urmt/CR_MLS --limit 5
```

### Manual Deployment (Emergency Only)

If you need to deploy without pushing to Git:

```bash
# 1. Validate data
npm run validate

# 2. Test locally
cd client && npm install && npm run build

# 3. Deploy to IPFS locally
./scripts/deploy-ipfs.sh

# 4. Pin to Pinata (requires API key)
curl -X POST https://api.pinata.cloud/pinning/pinFileToIPFS \
  -H "Authorization: Bearer YOUR_PINATA_JWT" \
  -F "file=@client/dist/index.html"
```

---

## Production Checklist

### Before Deploying to Production

- [ ] **Code Review**: PR has been reviewed and approved
- [ ] **Tests Pass**: `npm test && npm run validate`
- [ ] **Types Check**: `npm run type-check` (no errors)
- [ ] **Linting**: `npm run lint` (no errors)
- [ ] **Formatting**: `npm run format` (code is clean)
- [ ] **Database Valid**: `npm run validate` (all properties valid)
- [ ] **No Secrets**: No API keys or credentials in code
- [ ] **Documentation**: README.md and related docs updated
- [ ] **Changelog**: Updated relevant .md files
- [ ] **Git Tag**: Version tagged in Git (optional)

### Deployment Verification

After deployment completes:

```bash
# 1. Check workflow succeeded
gh run view --repo urmt/CR_MLS [RUN_ID] -v

# 2. Verify IPFS accessibility
curl https://ipfs.io/ipfs/[CID]/index.html | head -20

# 3. Check database freshness
git log --oneline database/properties/active.json | head -3

# 4. Verify latest deployment
cat database/deployments/latest.json

# 5. Check email campaign results
cat database/email-campaigns/last-campaign.json
```

---

## GitHub Actions Setup

### Initial Setup (One-time)

#### 1. Enable GitHub Actions

```bash
# Go to Settings → Actions → General
# ✅ Enable "Allow all actions and reusable workflows"
# ✅ Enable "Allow GitHub Actions to create and approve pull requests"
```

#### 2. Add Required Secrets

Go to: https://github.com/urmt/CR_MLS/settings/secrets/actions

**Create these secrets:**

```
PINATA_API_KEY          = Get from https://app.pinata.cloud/keys
PINATA_SECRET           = Get from https://app.pinata.cloud/keys
EMAILJS_SERVICE_ID      = Get from https://dashboard.emailjs.com
EMAILJS_TEMPLATE_ID     = Get from https://dashboard.emailjs.com
EMAILJS_PUBLIC_KEY      = Get from https://dashboard.emailjs.com
PAYPAL_CLIENT_ID        = Get from https://developer.paypal.com
VITE_PAYPAL_CLIENT_ID   = Same as PAYPAL_CLIENT_ID
AWS_LAMBDA_PDF_URL      = Your Lambda function URL
VITE_AWS_LAMBDA_PDF_URL = Same as AWS_LAMBDA_PDF_URL
VITE_MASTER_KEY         = Encryption key (generate random: openssl rand -hex 16)
VITE_GITHUB_RAW_URL     = https://raw.githubusercontent.com/urmt/CR_MLS/main/database
```

**Generate Master Key:**

```bash
# macOS/Linux
openssl rand -hex 16

# Windows (PowerShell)
$null = [Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(16)
```

#### 3. Verify Workflow File

Check `.github/workflows/autonomous-mls.yml` exists and is valid:

```bash
# Validate YAML
python -m yaml .github/workflows/autonomous-mls.yml

# Or use online validator:
# https://www.yamllint.com/
```

### Scheduled Workflows

The project runs on schedule:

```yaml
# Every 6 hours
- cron: '0 */6 * * *'    # 00:00, 06:00, 12:00, 18:00 UTC

# Weekly purging
- cron: '0 2 * * SUN'    # Sundays at 2 AM UTC
```

**To view scheduled runs:**

```bash
gh workflow view "Autonomous Costa Rica MLS" --repo urmt/CR_MLS
```

### Manual Workflow Triggers

```bash
# Trigger scraping only
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=scrape

# Trigger full workflow (scrape + purge + email + deploy)
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=full

# Trigger specific action
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=deploy

# Monitor running workflow
gh run watch --repo urmt/CR_MLS
```

---

## IPFS Deployment

### Architecture

```
┌─────────────────────────────────────────────┐
│     GitHub Actions (Automated)              │
├─────────────────────────────────────────────┤
│ 1. Checkout code                            │
│ 2. Build React client (npm run build)       │
│ 3. Add to local IPFS node                   │
│ 4. Pin to Pinata (automatic)                │
│ 5. Update deployment record                 │
│ 6. Commit to GitHub                         │
└─────────────────────────────────────────────┘
           ↓
    IPFS Network (Public)
           ↓
    ┌─────────────────────────────────────────┐
    │  Multiple Gateway Options               │
    ├─────────────────────────────────────────┤
    │  • https://w3s.link/ipfs/[CID]          │
    │  • https://ipfs.io/ipfs/[CID]           │
    │  • https://dweb.link/ipfs/[CID]         │
    │  • https://gateway.pinata.cloud/...     │
    └─────────────────────────────────────────┘
```

### IPFS Gateway URLs

Current deployment accessible at:

```
Primary:     https://w3s.link/ipfs/[CID]
IPFS.io:     https://ipfs.io/ipfs/[CID]
Dweb.link:   https://dweb.link/ipfs/[CID]
Pinata:      https://gateway.pinata.cloud/ipfs/[CID]
```

**Find current CID:**

```bash
cat database/deployments/latest.json | jq '.ipfs_hash'
```

### Local IPFS Setup

For development or testing:

```bash
# 1. Install IPFS
brew install ipfs  # macOS
sudo apt install go-ipfs  # Linux
# Or download from: https://dist.ipfs.tech/

# 2. Initialize
ipfs init
ipfs config --json Addresses.API /ip4/127.0.0.1/tcp/5001
ipfs config --json Addresses.Gateway /ip4/127.0.0.1/tcp/8080

# 3. Start daemon
ipfs daemon

# 4. In another terminal, deploy:
./scripts/deploy-ipfs.sh

# 5. Access locally
open http://localhost:8080/ipfs/[CID]
```

### Pinata Integration

Pinata automatically pins deployments. To manually pin:

```bash
# Get your Pinata JWT token from: https://app.pinata.cloud/keys

curl -X POST https://api.pinata.cloud/pinning/pinByHash \
  -H "Authorization: Bearer YOUR_PINATA_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "hashToPin": "bafybeib64c57izfummczi6lrs4l3q5xjnhbq6pclhx4u472yrtuaohy2iu",
    "pinataMetadata": {
      "name": "CR-MLS-Deployment",
      "keyvalues": {
        "date": "'$(date -Iseconds)'",
        "version": "1.1.0"
      }
    }
  }'
```

---

## Monitoring & Alerts

### GitHub Actions Dashboard

Monitor all workflows:

```bash
# List recent runs
gh run list --repo urmt/CR_MLS --limit 10

# View specific run
gh run view [RUN_ID] --repo urmt/CR_MLS -v

# Watch live
gh run watch --repo urmt/CR_MLS

# Get logs from failed run
gh run view [RUN_ID] --repo urmt/CR_MLS --log-failed
```

### IPFS Availability Monitoring

Check if site is accessible:

```bash
# Quick check
curl -I https://ipfs.io/ipfs/[CID]/index.html

# Full page test
curl -s https://ipfs.io/ipfs/[CID]/index.html | head -50

# Monitor uptime
while true; do
  if curl -s https://ipfs.io/ipfs/[CID]/index.html > /dev/null; then
    echo "✅ $(date): IPFS available"
  else
    echo "❌ $(date): IPFS DOWN"
  fi
  sleep 300  # Check every 5 minutes
done
```

### Database Freshness

```bash
# Check when last scraped
git log --oneline -1 database/properties/active.json

# Show scraping stats
cat database/scraping/last-run.json | jq '.statistics'

# Check for errors
cat logs/pipeline-*.json | jq '.errors[]' | head -20
```

### Log Analysis

```bash
# Show recent logs
ls -lh logs/pipeline-*.json | tail -5

# View latest log
cat logs/pipeline-$(ls logs | grep pipeline | sort -r | head -1).json | jq '.'

# Find errors
cat logs/pipeline-*.json | jq 'select(.errors | length > 0)'

# Count properties per source
cat database/properties/active.json | jq '.properties | group_by(.source) | map({source: .[0].source, count: length})'
```

### Create Monitoring Scripts

**`scripts/monitor-health.js`** (example):

```bash
#!/usr/bin/env node
// Monitor system health
const fs = require('fs');
const path = require('path');

// Check IPFS
// Check database freshness
// Check scraping success rate
// Send alerts if needed

console.log('System health check...');
```

---

## Troubleshooting

### Workflow Failed

**Check GitHub Actions logs:**

```bash
# Get the failed run
gh run list --repo urmt/CR_MLS | grep "FAILED"

# View error logs
gh run view [RUN_ID] --repo urmt/CR_MLS --log

# Get full log for debugging
gh run download [RUN_ID] --repo urmt/CR_MLS -D ~/run-logs/
```

### Scraping Found 0 Properties

```bash
# 1. Check if source is active
cat database/scraping/sources.json | jq '.sources[] | select(.active == true)'

# 2. Run manual scraper
node scripts/scraper.js

# 3. Check error logs
cat logs/pipeline-*.json | jq '.errors[]'

# 4. Test single source
node scripts/test-single-source.js [source_name]
```

### IPFS Not Accessible

```bash
# 1. Check if pinned
curl -X GET https://api.pinata.cloud/data/pinList \
  -H "Authorization: Bearer YOUR_PINATA_JWT" | jq '.rows[] | select(.ipfs_pin_hash == "[CID]")'

# 2. Try different gateway
curl https://dweb.link/ipfs/[CID]/
curl https://gateway.pinata.cloud/ipfs/[CID]/

# 3. Re-pin to Pinata
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=deploy

# 4. Check local IPFS daemon
ipfs swarm peers
ipfs dht stat
```

### Email Campaigns Not Sending

```bash
# 1. Check credentials
echo $EMAILJS_SERVICE_ID
echo $EMAILJS_TEMPLATE_ID

# 2. Test EmailJS manually
node scripts/test-emailjs.js

# 3. Check campaign logs
cat database/email-campaigns/last-campaign.json

# 4. Verify subscriber list
cat database/subscribers/by-category.json | jq '.categories.residential.subscribers | length'
```

### Database Corruption

```bash
# Run recovery
node scripts/recovery.js repair

# Or full recovery
node scripts/recovery.js full

# Or restore from backup
node scripts/recovery.js restore database/backups/[backup-file]
```

---

## Rollback Procedures

### Quick Rollback (Last 24 Hours)

```bash
# 1. View git history
git log --oneline -10 database/properties/active.json

# 2. Find commit to revert to
git revert [COMMIT_SHA]

# 3. Push (triggers redeployment)
git push origin main

# 4. Monitor deployment
gh run watch --repo urmt/CR_MLS
```

### Full System Rollback

If something is severely broken:

```bash
# 1. Get latest working backup
ls -lhS database/backups/ | head -5

# 2. Restore from backup
node scripts/recovery.js restore database/backups/[backup-name].json

# 3. Verify data
npm run validate

# 4. Commit recovery
git add database/
git commit -m "🔧 Rollback to stable state"
git push origin main
```

### IPFS Rollback

If latest IPFS deployment is bad:

```bash
# 1. Find previous good CID
cat database/deployments/ipfs-history.json | jq '.history[-2]'

# 2. Point to previous version
# Update documentation with old CID temporarily

# 3. Redeploy current main
gh workflow run "Autonomous Costa Rica MLS" \
  --repo urmt/CR_MLS \
  --field action=deploy
```

---

## Maintenance Schedule

### Daily
- Monitor GitHub Actions for failed runs
- Check IPFS accessibility on at least one gateway

### Weekly
- Review property database health
- Check error logs for patterns
- Verify scraping is finding properties

### Monthly
- Rotate API credentials if needed
- Review and update dependencies: `npm audit`
- Update documentation

### Quarterly
- Security audit
- Performance review
- Backup verification

---

## Contact & Support

For deployment issues:
- Check logs in `.github/workflows/`
- Review `logs/pipeline-*.json`
- Create GitHub Issue with error logs
- Contact: [your-email@example.com]

---

**Last Updated:** December 10, 2025
