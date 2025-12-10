# 📋 Costa Rica MLS - Quick Reference Card

**Version**: 1.1.0 (Production Hardened)  
**Status**: 🟢 Ready for Production  
**Last Updated**: December 10, 2025

---

## 🚀 Quick Start

```bash
# Clone & setup
git clone https://github.com/urmt/CR_MLS.git
cd CR_MLS_New
npm install && cd client && npm install && cd ..

# Start development
./scripts/sync-database-to-client.sh
cd client && npm run dev   # http://localhost:5173

# Test everything
npm test && npm run validate && npm run lint
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `README.md` | 📖 Main documentation |
| `START-HERE.md` | 🚀 Current status & next steps |
| `CONTRIBUTING.md` | 👨‍💻 Developer guidelines |
| `DEPLOYMENT.md` | 🚀 Deployment & monitoring |
| `SECURITY.md` | 🔐 Security policies |
| `API-INTEGRATION-GUIDE.md` | 🔑 When API credentials arrive |
| `.github/workflows/autonomous-mls.yml` | ⚙️ GitHub Actions automation |
| `database/properties/active.json` | 📊 402 live properties |

---

## 🔧 Essential Commands

### Code Quality
```bash
npm run lint        # Check & fix ESLint
npm run format      # Format with Prettier
npm run type-check  # TypeScript strict mode
npm test           # Run Jest tests
npm run validate   # Check property data
```

### Development
```bash
npm install                 # Install dependencies
npm run dev                 # Start dev server (client/)
npm run build               # Build for production
./scripts/sync-database-to-client.sh  # Sync live data
```

### System Recovery
```bash
node scripts/recovery.js full       # Full recovery
node scripts/recovery.js repair     # Repair database
node scripts/recovery.js deduplicate # Remove duplicates
node scripts/validate-properties.js # Validate data
```

### GitHub Actions
```bash
gh workflow run "Autonomous Costa Rica MLS" --field action=full
gh run list --repo urmt/CR_MLS
gh run watch --repo urmt/CR_MLS
```

---

## 🔐 Security Checklist

- ✅ Never commit API keys (use GitHub Secrets)
- ✅ Pre-commit hooks prevent accidental commits
- ✅ Update GitHub Secrets: https://github.com/urmt/CR_MLS/settings/secrets/actions
- ✅ Rotate credentials every 90 days
- ✅ Use `.env.example` as template (no actual values)

---

## 📊 Current Data

| Metric | Value |
|--------|-------|
| Total Properties | 402 real listings |
| Active Sources | 6 sources |
| Last Scraped | Every 6 hours (automated) |
| Database Size | ~5-10 MB |
| IPFS Accessible | ✅ Yes (3+ gateways) |

---

## 🌐 Live URLs

```
Primary:   https://w3s.link/ipfs/[CID]
IPFS.io:   https://ipfs.io/ipfs/[CID]
Dweb:      https://dweb.link/ipfs/[CID]
Pinata:    https://gateway.pinata.cloud/ipfs/[CID]

Find [CID]: cat database/deployments/latest.json | jq '.ipfs_hash'
```

---

## 👥 Team Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes & test
npm run format && npm run lint && npm test

# Commit (pre-commit hooks validate)
git commit -m "feat: description"
git push origin feature/my-feature

# Create PR & merge to main
# GitHub Actions automatically:
#   1. Runs tests
#   2. Validates data
#   3. Builds client
#   4. Deploys to IPFS
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail | `npm test -- --watch` to debug |
| Linting errors | `npm run lint` (auto-fix) |
| TypeScript errors | `npm run type-check` to see all |
| Properties not loading | `./scripts/sync-database-to-client.sh` |
| Scraper failed | `cat logs/pipeline-*.json \| jq '.errors'` |
| IPFS not accessible | Try different gateway (see above) |
| Database corrupted | `node scripts/recovery.js full` |

---

## 📞 Documentation Map

```
Start → README.md (overview)
  ↓
START-HERE.md (current status)
  ├→ CONTRIBUTING.md (development)
  ├→ DEPLOYMENT.md (operations)
  ├→ SECURITY.md (security)
  ├→ API-INTEGRATION-GUIDE.md (future)
  └→ WARP.md (architecture)
```

---

## ⏰ Automation Schedule

| When | What |
|------|------|
| Every 6 hours | Property scraping |
| After scraping | Email campaigns |
| Weekly (Sunday 2 AM) | 90-day property cleanup |
| Auto-triggered | IPFS deployment |

---

## 🎯 Status Dashboard

```bash
# Check everything at once
npm run type-check && npm run lint && npm test && npm run validate

# Monitor GitHub Actions
gh run list --repo urmt/CR_MLS --limit 5

# Check IPFS
curl -I https://ipfs.io/ipfs/[CID]/index.html

# Verify database
cat database/properties/active.json | jq '.properties | length'

# Check logs
tail -20 logs/pipeline-*.json
```

---

## 🔑 GitHub Secrets Required

```
✅ PINATA_API_KEY
✅ PINATA_SECRET
✅ EMAILJS_SERVICE_ID
✅ EMAILJS_TEMPLATE_ID
✅ EMAILJS_PUBLIC_KEY
✅ PAYPAL_CLIENT_ID
✅ VITE_PAYPAL_CLIENT_ID
✅ AWS_LAMBDA_PDF_URL
✅ VITE_AWS_LAMBDA_PDF_URL
✅ VITE_MASTER_KEY
✅ VITE_GITHUB_RAW_URL

⏳ BCCR_API_USER (awaiting credential)
⏳ BCCR_API_PASS (awaiting credential)
⏳ REGISTRO_NACIONAL_CERT (awaiting credential)
⏳ REGISTRO_NACIONAL_TOKEN (awaiting credential)
```

---

## 📈 Next Milestones

| Priority | Task | Timeline | Status |
|----------|------|----------|--------|
| 🟢 High | Government API credentials | Dec 15-25 | ⏳ Pending |
| 🟡 Medium | Integrate BCCR API | Week 2 | ⏳ Blocked by credentials |
| 🟡 Medium | Integrate Registro Nacional | Week 3-4 | ⏳ Blocked by credentials |
| 🟢 Low | Machine learning for prices | Q1 2026 | 📋 Planned |
| 🟢 Low | Advanced reporting | Q1 2026 | 📋 Planned |

---

## 💡 Pro Tips

1. **Use `npm run format`** after coding (auto-fixes style)
2. **Create test scripts** for new features
3. **Check GitHub Actions** logs for deployment issues
4. **Use feature branches** for all changes
5. **Keep documentation updated** when changing code
6. **Monitor logs** after deployments
7. **Test locally** before pushing
8. **Use GitHub Secrets** for all credentials

---

## 🆘 Need Help?

- **Setup issues?** → README.md
- **Code questions?** → CONTRIBUTING.md
- **Deployment help?** → DEPLOYMENT.md
- **Security concerns?** → SECURITY.md
- **Ready for APIs?** → API-INTEGRATION-GUIDE.md
- **Architecture?** → WARP.md
- **Current status?** → START-HERE.md

---

**Keep this card handy! 📋**

Bookmark these URLs:
- GitHub: https://github.com/urmt/CR_MLS
- GitHub Secrets: https://github.com/urmt/CR_MLS/settings/secrets/actions
- GitHub Actions: https://github.com/urmt/CR_MLS/actions
- IPFS: https://ipfs.io/ipfs/[CID]/
