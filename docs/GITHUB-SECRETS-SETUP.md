# GitHub Repository Secrets Configuration Guide

This guide explains how to configure the required secrets for the ZEMO CI/CD pipeline.

---

## 📋 Required Secrets

Configure these secrets in your GitHub repository settings at:  
`https://github.com/YOUR_USERNAME/zemo/settings/secrets/actions`

### Critical Secrets (Required for Deployment)

#### 1. VERCEL_TOKEN
**Purpose:** Authenticate with Vercel for automated deployments

**How to get:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and get token
vercel login
vercel whoami

# Generate token at: https://vercel.com/account/tokens
```

**Add to GitHub:**
- Name: `VERCEL_TOKEN`
- Value: Your Vercel token (starts with `vercel_...`)

#### 2. VERCEL_ORG_ID
**Purpose:** Identify your Vercel organization

**How to get:**
```bash
# From project root
vercel link

# Copy the orgId from .vercel/project.json
cat .vercel/project.json
```

**Add to GitHub:**
- Name: `VERCEL_ORG_ID`
- Value: Your organization ID (format: `team_xxxxx` or `user_xxxxx`)

#### 3. VERCEL_PROJECT_ID
**Purpose:** Identify your Vercel project

**How to get:**
```bash
# From the same .vercel/project.json file
cat .vercel/project.json
```

**Add to GitHub:**
- Name: `VERCEL_PROJECT_ID`
- Value: Your project ID (format: `prj_xxxxx`)

---

## 🔒 Optional Secrets (Enhanced Features)

### Security Scanning

#### SNYK_TOKEN
**Purpose:** Enable Snyk security vulnerability scanning

**How to get:**
1. Sign up at https://snyk.io
2. Go to Account Settings → General
3. Copy your API token

**Add to GitHub:**
- Name: `SNYK_TOKEN`
- Value: Your Snyk API token

**Note:** If not configured, the security scan step will be skipped (continue-on-error: true)

---

### Performance Monitoring

#### LHCI_GITHUB_APP_TOKEN
**Purpose:** Enable Lighthouse CI GitHub App integration

**How to get:**
1. Install Lighthouse CI GitHub App: https://github.com/apps/lighthouse-ci
2. Generate token from app settings

**Add to GitHub:**
- Name: `LHCI_GITHUB_APP_TOKEN`
- Value: Your Lighthouse CI token

**Note:** If not configured, Lighthouse will still run but won't post PR comments

---

### Code Coverage

#### CODECOV_TOKEN
**Purpose:** Upload test coverage reports to Codecov

**How to get:**
1. Sign up at https://codecov.io
2. Add your GitHub repository
3. Copy the upload token

**Add to GitHub:**
- Name: `CODECOV_TOKEN`
- Value: Your Codecov upload token

---

## 🌍 Environment Secrets (Staging & Production)

These should also be configured in Vercel dashboard for the deployed application:

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/zemo

# Authentication
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<different-64-char-random-string>

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
MTN_MOMO_SUBSCRIPTION_KEY=...
AIRTEL_MONEY_CLIENT_ID=...
ZAMTEL_KWACHA_API_KEY=...
DPO_COMPANY_TOKEN=...

# Communication
AFRICASTALKING_API_KEY=...
SENDGRID_API_KEY=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...

# PWA
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

See [.env.example](./../.env.example) for complete list.

---

## 🔧 How to Add Secrets to GitHub

### Via GitHub Web UI

1. Go to repository settings: `https://github.com/YOUR_USERNAME/zemo/settings`
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Enter secret name (exactly as shown above)
5. Paste secret value
6. Click "Add secret"

### Via GitHub CLI

```bash
# Install GitHub CLI
# https://cli.github.com/

# Authenticate
gh auth login

# Add secrets
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh secret set SNYK_TOKEN
gh secret set CODECOV_TOKEN
gh secret set LHCI_GITHUB_APP_TOKEN
```

---

## ✅ Verification

After adding secrets, verify they're configured:

```bash
# List configured secrets
gh secret list

# Expected output:
# CODECOV_TOKEN           Updated 2025-XX-XX
# LHCI_GITHUB_APP_TOKEN   Updated 2025-XX-XX
# SNYK_TOKEN              Updated 2025-XX-XX
# VERCEL_ORG_ID           Updated 2025-XX-XX
# VERCEL_PROJECT_ID       Updated 2025-XX-XX
# VERCEL_TOKEN            Updated 2025-XX-XX
```

---

## 🚀 Testing the Pipeline

Once secrets are configured, test the pipeline:

1. **Push a commit to trigger CI:**
   ```bash
   git add .
   git commit -m "test: verify CI/CD pipeline"
   git push origin main
   ```

2. **Check workflow run:**
   - Go to `https://github.com/YOUR_USERNAME/zemo/actions`
   - Click on the latest workflow run
   - Verify all jobs pass (green checkmarks)

3. **Expected behavior:**
   - ✅ Lint job passes
   - ✅ TypeCheck job passes
   - ✅ Test job passes
   - ✅ Security job runs (may show warnings if vulnerabilities found)
   - ✅ Build job passes
   - ✅ Lighthouse job runs
   - ✅ Migration-check job passes
   - ✅ Deploy-production job runs (on main branch push)

---

## 🐛 Troubleshooting

### Secret not found errors

**Problem:** `Error: Secret VERCEL_TOKEN not found`

**Solution:** 
- Verify secret name is exactly correct (case-sensitive)
- Check secret is added at repository level (not organization)
- Re-add the secret if it was recently created

### Vercel deployment fails

**Problem:** `Error: Invalid token`

**Solution:**
```bash
# Generate new Vercel token
vercel login
# Visit: https://vercel.com/account/tokens
# Create new token with full permissions
# Update GitHub secret
```

### Snyk scan fails

**Problem:** `Error: Unauthorized`

**Solution:**
- Verify Snyk token is valid
- Check Snyk account has access to scan
- Token should not have quotes around it

---

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CI/CD Guide](https://vercel.com/docs/concepts/deployments/git)
- [Snyk GitHub Integration](https://docs.snyk.io/integrations/git-repository-scm-integrations/github-integration)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

---

## 🔐 Security Best Practices

1. **Never commit secrets to code**
   - All secrets should be in GitHub Secrets or Vercel Environment Variables
   - Never in `.env` files committed to git

2. **Rotate secrets regularly**
   - Change Vercel tokens every 90 days
   - Update API keys when team members leave

3. **Use least privilege**
   - Give tokens only the permissions they need
   - Use separate tokens for dev/staging/prod

4. **Monitor secret usage**
   - Check GitHub Actions logs for unauthorized access
   - Review Vercel deployment logs regularly

---

**Last Updated:** November 12, 2025  
**Maintained By:** ZEMO DevOps Team
