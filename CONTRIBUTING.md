# Contributing to Costa Rica MLS

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for development.

## Code of Conduct

- Be respectful and constructive
- Focus on ideas, not individuals
- Help maintain a welcoming environment

## Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/CR_MLS.git
cd CR_MLS_New
npm install
```

### 2. Create Feature Branch
**Important**: Never commit directly to `main` or `master`
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-name
# or
git checkout -b docs/documentation-update
```

### 3. Set Up Pre-commit Hooks
```bash
npm install                    # Installs husky
husky install                  # Sets up git hooks
chmod +x .husky/pre-commit    # Make hooks executable
```

## Development Workflow

### Code Quality Standards

All code must pass these checks before committing:

```bash
# 1. Type checking (no TypeScript errors)
npm run type-check

# 2. Linting (no ESLint errors)
npm run lint

# 3. Code formatting (must use Prettier)
npm run format

# 4. Tests must pass
npm test

# 5. Data validation (for database changes)
npm run validate
```

### Pre-commit Hooks

The project uses Husky to prevent bad commits. Hooks automatically:
- ❌ **Block commits** if API keys/secrets are exposed
- ❌ **Block direct commits** to main/master branches
- ✅ **Auto-fix** linting issues with ESLint
- ✅ **Warn** about large files (>10MB)

### Testing

Write tests for all new features:

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test
npm test -- scripts/validation.test.js
```

**Test file locations:**
- Unit tests: `src/**/__tests__/**/*.test.ts` or `src/**/*.test.ts`
- Integration tests: `scripts/__tests__/integration/*.test.js`

### Code Standards

#### TypeScript
- **Strict mode enabled**: No `any` types allowed (use generics instead)
- **Return types required**: Always specify function return types
- **No unused variables**: All imports must be used
- **Error handling**: Every promise must have error handling

```typescript
// ✅ GOOD
async function fetchProperties(): Promise<Property[]> {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch: ${error.message}`);
  }
}

// ❌ BAD
async function fetchProperties() {  // Missing return type
  const response = await fetch(url);
  return response.json();  // No error handling
}
```

#### JavaScript
- **Use const by default**, let when needed, avoid var
- **Arrow functions** for callbacks
- **Destructuring** for object/array access
- **Template literals** for strings

```javascript
// ✅ GOOD
const { name, email } = user;
const message = `Hello ${name}, your email is ${email}`;
const process = () => data.map(item => item.value);

// ❌ BAD
var name = user.name;
var email = user.email;
var message = "Hello " + name + ", your email is " + email;
const process = function(x) { return x.value; };
```

#### Comments
- **Explain WHY**, not WHAT
- Use JSDoc for exported functions

```typescript
// ✅ GOOD
/** Fetches properties from multiple sources and deduplicates */
async function scrapeAllSources(): Promise<Property[]> {
  // We need to fetch serially due to rate limiting
  const results = [];
  for (const source of SOURCES) {
    results.push(await source.scrape());
  }
  return deduplicateByHash(results);
}

// ❌ BAD
// Get properties
async function scrapeAllSources() {
  // Loop through sources
  for (const source of SOURCES) {
    // Fetch from source
    results.push(await source.scrape());
  }
}
```

## Adding New Property Sources

### 1. Create Source File
```typescript
// src/sources/new-source.ts
export interface NewSourceConfig {
  name: string;
  baseUrl: string;
  // ... other config
}

export async function scrapeNewSource(
  config: NewSourceConfig
): Promise<Property[]> {
  // Implement scraping logic
  return [];
}
```

### 2. Update Configuration
Add to `database/scraping/sources.json`:
```json
{
  "newsource_cr": {
    "name": "New Source Costa Rica",
    "base_url": "https://...",
    "active": true,
    "priority": 1,
    "scrape_frequency": "every_6_hours"
  }
}
```

### 3. Test the Source
```bash
node scripts/test-single-source.js newsource_cr
```

### 4. Submit PR with Documentation
- Include sample properties in PR description
- Document any special handling or rate limits
- Update `README-OMNIMLS.md` template with setup instructions

## Submitting Changes

### 1. Write Tests
```bash
npm test -- --watch
# Add your test cases in __tests__ directory
```

### 2. Format Code
```bash
npm run format    # Auto-format with Prettier
npm run lint      # Fix ESLint issues
npm run type-check  # Check TypeScript
```

### 3. Commit with Clear Messages
```bash
# Use conventional commit format
git commit -m "feat: add new property source"
git commit -m "fix: handle rate limiting"
git commit -m "docs: update setup instructions"
git commit -m "refactor: simplify data validation"
git commit -m "test: add scraper tests"
```

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
# Then create PR on GitHub
```

### 5. PR Description

Include:
- **What**: Brief description of changes
- **Why**: Motivation for this change
- **How**: Technical approach
- **Testing**: How to verify the change works
- **Checklist**:
  - [ ] Tests pass (`npm test`)
  - [ ] Code formatted (`npm run format`)
  - [ ] Types check (`npm run type-check`)
  - [ ] Linting passes (`npm run lint`)
  - [ ] Data validates (`npm run validate`)
  - [ ] No secrets leaked
  - [ ] Documentation updated

### Example PR:
```markdown
## Description
Adds Lamudi as a new property scraping source for Costa Rica.

## Changes
- Creates `src/sources/lamudi.ts` with API integration
- Adds Lamudi configuration to `database/scraping/sources.json`
- Implements country filtering (Costa Rica only)

## Testing
```bash
npm test
node scripts/test-single-source.js lamudi_cr
npm run validate
```

## Checklist
- [x] Tests pass
- [x] Code formatted
- [x] No secrets exposed
- [x] Documentation updated
```

## Security Guidelines

### 🔐 API Keys & Credentials
- **NEVER** commit API keys, passwords, or secrets
- Use GitHub Secrets for sensitive credentials
- Use `.env.example` as template (without values)

### 🔒 Pre-commit Hooks
Pre-commit hooks automatically block commits with:
- Common secret patterns (API_KEY, SECRET, password, token)
- Long hex strings (suspicious credentials)
- Base64 encoded content (potential secrets)

### If You Accidentally Leak Secrets:
```bash
# 1. Immediately revoke credentials in provider dashboard
# 2. Create new credentials
# 3. Update GitHub Secrets
# 4. Force push branch update:
git reset HEAD~1
# Remove secret file
git commit
git push --force-with-lease
```

## Documentation

### Updating README
- Keep main README.md as overview
- Link to detailed guides (WARP.md, README-REAL-DATA.md, etc.)
- Update "Last Updated" date
- Add examples for new features

### Adding Comments
```typescript
/**
 * Fetches property data from GitHub database
 * @param category - Filter by property category
 * @returns Promise resolving to property array
 * @throws Error if fetch fails
 */
export async function getProperties(category?: string): Promise<Property[]> {
  // Implementation
}
```

## Common Tasks

### Run Full Validation
```bash
npm run type-check && npm run lint && npm test && npm run validate
```

### Debug a Failing Test
```bash
npm test -- --watch --testNamePattern="my test name"
```

### Check Code Coverage
```bash
npm test -- --coverage
# Open coverage/lcov-report/index.html in browser
```

### Add New Dependency
```bash
# Ask before adding - keep dependencies minimal
npm install package-name
git add package.json package-lock.json
git commit -m "dep: add package-name for feature-x"
```

## Getting Help

- **Questions?** Open a Discussion on GitHub
- **Found a bug?** Open an Issue with reproduction steps
- **Feature idea?** Start a Discussion first
- **Security issue?** Email privately, don't open public issue

## Deployment

When your PR is merged to `main`:
1. Automated tests run
2. Code quality checks pass
3. GitHub Actions deploys to IPFS automatically
4. Update goes live in ~30 minutes

---

Thank you for contributing! 🚀
