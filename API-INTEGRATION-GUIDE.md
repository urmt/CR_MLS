# 🔑 API Credentials Integration Guide

When you receive government API credentials, follow this guide to integrate them into the system.

**Status**: Framework ready, awaiting credentials  
**Estimated Timeline**: 2-4 weeks for all credentials

---

## 📋 APIs Needed

### 1. BCCR (Central Bank of Costa Rica)
**Purpose**: Exchange rates, housing price index, mortgage rates  
**Timeline**: 3-5 business days  
**Effort to integrate**: 1-2 hours

**Application Process**:
1. Visit: https://gee.bccr.fi.cr/
2. Register for API access
3. Submit business justification for real estate data
4. Receive credentials via email

**What You'll Receive**:
- API Username
- API Password
- API Endpoint URL

**Integration Steps**:
```bash
# 1. Add to GitHub Secrets
# Go to: Settings → Secrets and variables → Actions
# Add:
BCCR_API_USER=<your-username>
BCCR_API_PASS=<your-password>

# 2. Update environment
echo "BCCR_API_USER=<user>" >> .env.production
echo "BCCR_API_PASS=<pass>" >> .env.production

# 3. Uncomment enrichment in pipeline
# Edit: scripts/real-data-pipeline.js
# Uncomment: await enrichmentService.bccr(property)

# 4. Test
node scripts/test-enrichment-bccr.js

# 5. Deploy
git add .
git commit -m "feat: enable BCCR API enrichment"
git push origin main
```

---

### 2. Registro Nacional (Property Registry)
**Purpose**: Property ownership, cadastral numbers, title status  
**Timeline**: 2-4 weeks  
**Effort to integrate**: 2-3 hours

**Application Process**:
1. Visit: https://www.registronacional.go.cr/
2. Apply for digital certificate for property lookups
3. Submit notarized application with:
   - Business documentation
   - Tax ID (CÉDULA JURÍDICA)
   - Authorized representative ID
4. Receive certificate and access token

**What You'll Receive**:
- Digital Certificate (PEM file)
- Private Key
- API Token
- API Endpoint

**Integration Steps**:
```bash
# 1. Save certificate files
mkdir -p certificates/
# Place certificate.pem in certificates/
# Place private-key.pem in certificates/

# 2. Add to GitHub Secrets
REGISTRO_NACIONAL_CERT=<base64-encoded-pem>
REGISTRO_NACIONAL_TOKEN=<api-token>
REGISTRO_NACIONAL_ENDPOINT=<api-url>

# 3. Encode certificate for GitHub Secrets
base64 -i certificates/certificate.pem | pbcopy  # macOS
# or
base64 certificates/certificate.pem | xclip -selection clipboard  # Linux

# 4. Update environment
echo "REGISTRO_NACIONAL_CERT=<base64-pem>" >> .env.production
echo "REGISTRO_NACIONAL_TOKEN=<token>" >> .env.production

# 5. Enable in pipeline
# Edit: scripts/real-data-pipeline.js
# Uncomment: await enrichmentService.registroNacional(property)

# 6. Test
node scripts/test-enrichment-registro.js

# 7. Deploy
git add .
git commit -m "feat: enable Registro Nacional API enrichment"
git push origin main
```

---

### 3. Municipal APIs (San José, Escazú, Santa Ana)
**Purpose**: Property taxes, cadastral values, zoning information  
**Timeline**: Variable (1-3 weeks per municipality)  
**Effort to integrate**: 2-3 hours total

**San José - Open Data**:
1. Visit: https://datosabiertos.msj.go.cr/
2. Register for API key
3. Instant approval
4. Receive API token

**Escazú & Santa Ana**:
1. Contact municipal government
2. Request property data API access
3. Complete authorization process
4. Receive API credentials

**Integration Steps**:
```bash
# 1. Add to GitHub Secrets
SANJOSE_OPENDATA_TOKEN=<token>
ESCAZU_API_TOKEN=<token>
ESCAZU_API_KEY=<key>
SANTAANA_API_TOKEN=<token>

# 2. Update environment
echo "SANJOSE_OPENDATA_TOKEN=<token>" >> .env.production
echo "ESCAZU_API_TOKEN=<token>" >> .env.production
echo "SANTAANA_API_TOKEN=<token>" >> .env.production

# 3. Enable in pipeline
# Edit: scripts/real-data-pipeline.js
# Uncomment: await enrichmentService.municipal(property)

# 4. Test each municipality
node scripts/test-enrichment-sanjose.js
node scripts/test-enrichment-escazu.js
node scripts/test-enrichment-santaana.js

# 5. Deploy
git add .
git commit -m "feat: enable municipal API enrichment"
git push origin main
```

---

### 4. MOPT (Ministry of Transport) - Flood Risk
**Purpose**: Flood zone assessments, risk levels  
**Timeline**: 1-2 weeks  
**Effort to integrate**: 1 hour

**Application Process**:
1. Visit: https://www.mopt.go.cr/
2. Request flood risk data API access
3. Receive API credentials

**Integration Steps**:
```bash
# 1. Add to GitHub Secrets
MOPT_API_KEY=<key>
MOPT_API_ENDPOINT=<url>

# 2. Enable in pipeline
# Edit: scripts/real-data-pipeline.js
# Uncomment: await enrichmentService.floodRisk(property)

# 3. Test
node scripts/test-enrichment-mopt.js

# 4. Deploy
git commit -m "feat: enable MOPT flood risk enrichment"
git push origin main
```

---

### 5. MINAE (Ministry of Environment) - Energy Certification
**Purpose**: Green building certifications, energy efficiency  
**Timeline**: 1-2 weeks  
**Effort to integrate**: 1 hour

**Application Process**:
1. Visit: https://www.minae.go.cr/
2. Request energy certification API access
3. Receive API credentials

**Integration Steps**:
```bash
# 1. Add to GitHub Secrets
MINAE_API_KEY=<key>
MINAE_API_ENDPOINT=<url>

# 2. Enable in pipeline
# Edit: scripts/real-data-pipeline.js
# Uncomment: await enrichmentService.energyCertification(property)

# 3. Test
node scripts/test-enrichment-minae.js

# 4. Deploy
git commit -m "feat: enable MINAE energy certification enrichment"
git push origin main
```

---

## 🔧 Integration Checklist

### For Each API

- [ ] **Credentials Received**
  - [ ] Username/password or token
  - [ ] API endpoint URL
  - [ ] Rate limits documented
  - [ ] Documentation reviewed

- [ ] **GitHub Secrets Added**
  - [ ] Secret name matches code
  - [ ] Value is correct
  - [ ] No extra spaces
  - [ ] Verified in GitHub UI

- [ ] **Code Updated**
  - [ ] Environment variables read from secrets
  - [ ] Error handling in place
  - [ ] Rate limiting implemented
  - [ ] Fallback to mock data

- [ ] **Testing**
  - [ ] Test script runs successfully
  - [ ] Sample data looks correct
  - [ ] Error cases handled
  - [ ] Logging includes debug info

- [ ] **Deployed**
  - [ ] Code committed
  - [ ] PR reviewed
  - [ ] Tests passing
  - [ ] Deployed to production
  - [ ] Monitored for errors

- [ ] **Documentation**
  - [ ] README updated
  - [ ] API details documented
  - [ ] Rate limits documented
  - [ ] Error codes documented

---

## 🚀 Integration Process (Step by Step)

### Step 1: Prepare Local Environment
```bash
cd /home/student/CR_MLS_New

# Ensure you're up to date
git pull origin main

# Install dependencies
npm install

# Check code structure
ls src/enrich/     # Check enrichment services
cat scripts/real-data-pipeline.js | grep -A 5 "enrichmentService"
```

### Step 2: Add First API (BCCR)
```bash
# 1. Add to GitHub Secrets
# Via: https://github.com/urmt/CR_MLS/settings/secrets/actions
# Name: BCCR_API_USER
# Value: <received-from-bccr>
# Name: BCCR_API_PASS
# Value: <received-from-bccr>

# 2. Update environment file
cat > .env.production << EOF
BCCR_API_USER=$(get-from-secrets)
BCCR_API_PASS=$(get-from-secrets)
EOF

# 3. Update code
# Edit src/enrich/bccr.ts to use real API
# Change from mock to real implementation

# 4. Test
npm run validate
npm test

# 5. Commit
git add src/ .env.production
git commit -m "feat: BCCR API enrichment implementation"
git push origin main
```

### Step 3: Add Remaining APIs
Repeat Step 2 for each API:
- Registro Nacional
- Municipal APIs
- MOPT
- MINAE

### Step 4: Full System Test
```bash
# Run complete pipeline
npm run validate
npm test
npm run type-check
npm run lint

# Test enrichment with real APIs
node scripts/real-data-pipeline.js

# Monitor logs
tail -f logs/pipeline-*.json

# Deploy
git push origin main
```

### Step 5: Monitor & Verify
```bash
# Check GitHub Actions
gh run list --repo urmt/CR_MLS --limit 5

# Verify properties enriched
cat database/properties/active.json | jq '.properties[0].enrichment'

# Check for errors
cat logs/pipeline-*.json | jq '.errors[]'
```

---

## ⚠️ Important Notes

### Security
- **Never commit credentials** to Git
- **Always use GitHub Secrets** for sensitive data
- **Rotate credentials** every 90 days
- **Use `.env.example`** as template (no actual values)

### Rate Limiting
Each API has rate limits. The system implements:
- Request queuing
- Exponential backoff on errors
- Per-API rate limiting (see `src/utils/httpClient.ts`)

### Error Handling
If an API fails:
- Logs error with full details
- Continues processing other properties
- Skips enrichment for failed properties
- Retries on next run

### Testing
Before deploying to production:
```bash
# Test each API individually
node scripts/test-enrichment-bccr.js
node scripts/test-enrichment-registro.js
# etc.

# Test full pipeline
node scripts/real-data-pipeline.js --test

# Validate output
npm run validate
```

---

## 📞 Support During Integration

If issues arise:

1. **Check logs**: `cat logs/pipeline-*.json`
2. **Test individually**: `node scripts/test-enrichment-[api].js`
3. **Review code**: `src/enrich/[api].ts`
4. **Debug mode**: `DEBUG=* node scripts/real-data-pipeline.js`
5. **GitHub Issues**: Create issue with error logs

---

## 📅 Expected Timeline

```
Week 1:  BCCR credentials (3-5 business days)
Week 2:  BCCR integrated + tested
Week 3:  Registro Nacional (2-4 weeks, so may take longer)
Week 4:  Municipal APIs + MOPT + MINAE
Week 5+: All integrated + optimized
```

---

## 🎯 Success Criteria

Once all APIs are integrated, verify:

- ✅ 100% of properties have enrichment data
- ✅ No errors in logs
- ✅ Database size reasonable (<50MB)
- ✅ Scraping/enrichment completes in <30 minutes
- ✅ All tests passing
- ✅ Code quality maintained (strict TypeScript, ESLint)
- ✅ Documentation updated

---

**When ready to start integration, open this file and follow the steps above.**

Good luck! 🚀
