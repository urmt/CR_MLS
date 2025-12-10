# Security Policy

## Reporting Security Vulnerabilities

**If you discover a security vulnerability, DO NOT open a public GitHub issue.**

Instead, please email your findings to: [your-email@example.com]

Include:
- Type of security issue (e.g., XSS, injection, secrets exposure)
- Location in the code
- Steps to reproduce
- Potential impact

We will acknowledge receipt within 24 hours and provide a timeline for fixes.

## Supported Versions

| Version | Supported | Status |
|---------|-----------|--------|
| 1.x | ✅ Yes | Current - gets all updates |
| 0.x | ❌ No | End of life |

## Security Practices

### API Keys & Secrets
- **NEVER commit** credentials to repository
- **Always use** GitHub Secrets for CI/CD
- **Rotate regularly** - Every 90 days recommended
- **Revoke immediately** if compromised

### GitHub Secrets Management

**Required Secrets:**
```
PINATA_API_KEY
PINATA_SECRET
EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY
PAYPAL_CLIENT_ID
AWS_LAMBDA_PDF_URL
VITE_MASTER_KEY
```

**To update a secret:**
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the new value
4. Delete old secret
5. Verify in next workflow run

### Pre-commit Hooks

The project uses Husky to prevent accidental secret commits:

```bash
# Hooks run automatically on git commit:
- Detects common secret patterns (API_KEY=, SECRET=, password, token)
- Blocks commits containing suspicious content
- Flags large files (>10MB)
```

**If pre-commit blocks your commit:**
```bash
# Review the files it's warning about
git status

# Remove sensitive content
# Then retry the commit
git commit -m "..."
```

### Dependency Security

Keep dependencies up to date:
```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review and install updates
npm update
```

### Code Security

- **TypeScript Strict Mode**: Enforces type safety
- **ESLint Rules**: Includes security plugin
- **No Eval**: Dynamic code execution disabled
- **URL Validation**: All URLs validated before use
- **Input Sanitization**: User inputs sanitized

### Data Security

**Personal Information:**
- Subscriber emails encrypted at rest
- Payment info handled by PayPal/Polygon (PCI compliant)
- No passwords stored (GitHub OAuth for auth)

**Property Data:**
- Scraped data is public (from real estate websites)
- No sensitive information stored
- Regular backups in secure locations

### Access Control

- **GitHub Team**: Only authorized members can merge PRs
- **Branch Protection**: `main` branch requires PR review
- **Deploy Permissions**: Only GitHub Actions can deploy
- **API Tokens**: Scoped to minimum required permissions

### IPFS & Decentralization

- **Content-Addressed**: All content identified by cryptographic hash
- **Pinning Service**: Pinata ensures availability
- **No Single Point of Failure**: Multiple IPFS gateways available

### Encryption

**Client-Side:**
- Master key for credential encryption (CryptoJS)
- Credentials encrypted before storage
- Never sent to backend servers

**In Transit:**
- All API requests use HTTPS
- GitHub API uses OAuth tokens
- Credentials never in URLs or logs

### Compliance

**GDPR (EU User Data):**
- Email subscriptions include opt-out
- No personal data stored beyond email
- Data deletion on request

**PCI DSS (Payment Data):**
- PayPal handles all payment processing
- We never see credit card details
- Polygon smart contract for crypto payments

## Incident Response

If a security incident occurs:

1. **Immediate Actions:**
   - Revoke compromised credentials
   - Generate new API keys
   - Update GitHub Secrets

2. **Assessment:**
   - Determine scope and impact
   - Check if data was accessed
   - Review logs for unauthorized access

3. **Communication:**
   - Notify affected users
   - Document timeline
   - Post-mortem analysis

4. **Prevention:**
   - Implement fixes
   - Add tests to prevent recurrence
   - Update security guidelines

## Third-Party Dependencies

Critical dependencies:
- **puppeteer** (web scraping) - Regular security updates
- **axios** (HTTP client) - Maintained actively
- **react** (frontend) - LTS releases
- **cheerio** (HTML parsing) - Well-maintained

All dependencies are pinned to specific versions to prevent unexpected breaking changes or security issues.

## Regular Audits

- Monthly npm audit runs
- Quarterly security review
- Annual penetration testing (recommended)

## Best Practices for Users

### If You Run Your Own Instance:

1. **Change Default Secrets**
   ```bash
   # Don't use example values
   # Generate new PayPal Client IDs
   # Create new Pinata API keys
   # Set unique encryption keys
   ```

2. **Secure Your IPFS Daemon**
   ```bash
   # Run on private network
   # Use firewall rules
   # Monitor access logs
   ```

3. **Protect GitHub Access**
   ```bash
   # Use personal access tokens with minimal scopes
   # Enable 2FA on GitHub
   # Review collaborators regularly
   ```

4. **Monitor Activity**
   ```bash
   # Check GitHub Actions logs
   # Monitor IPFS node
   # Review property database changes
   ```

## Questions?

For security-related questions (non-critical):
- Email: [your-email@example.com]
- GitHub Discussions: [create new discussion]

For code security questions:
- See CONTRIBUTING.md for development guidelines
- Check ESLint configuration for enabled checks
- Review TypeScript strict mode settings

---

**Last Updated:** December 10, 2025
**Policy Version:** 1.0
