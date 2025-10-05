# 🔧 Manual Workflow Fix Instructions

The automated workflow update failed due to GitHub permissions. Please follow these steps to fix the workflow manually:

## Problem
The GitHub Actions workflow is failing because it's trying to use `npm install fs-extra axios` but your project has a workspace setup that requires a different approach.

## Solution
Go to your GitHub repository and edit the workflow file:

1. **Navigate to**: https://github.com/urmt/CR_MLS/edit/main/.github/workflows/autonomous-mls.yml

2. **Find these lines** (around line 42):
   ```yaml
   - name: Install dependencies
     run: |
       npm install fs-extra axios
   ```

3. **Replace with**:
   ```yaml
   - name: Install dependencies
     run: |
       npm ci --only=production || npm install --production
   ```

4. **Find these lines** (around line 88):
   ```yaml
   - name: Install dependencies
     run: |
       npm install fs-extra
   ```

5. **Replace with**:
   ```yaml
   - name: Install dependencies
     run: |
       npm ci --only=production || npm install --production
   ```

6. **Find these lines** (around line 135):
   ```yaml
   - name: Install dependencies
     run: |
       npm install axios fs-extra
   ```

7. **Replace with**:
   ```yaml
   - name: Install dependencies
     run: |
       npm ci --only=production || npm install --production
   ```

8. **Commit the changes** with message: `🔧 Fix workflow dependency installation`

## Why This Fix Works
- `npm ci --only=production` uses your package-lock.json and respects workspace configuration
- Falls back to `npm install --production` if npm ci fails
- Uses production dependencies only, which includes fs-extra and axios from your package.json

## After Fixing
1. Go to **Actions** tab in your GitHub repository
2. Click **Run workflow** on the "Autonomous Costa Rica MLS" workflow
3. Select **scrape** and click **Run workflow**
4. The workflow should now succeed!

Your autonomous MLS system will then be fully operational with:
- ✅ Property generation every 6 hours
- ✅ 90-day property purging weekly
- ✅ Email campaigns after scraping
- ✅ IPFS deployment automation