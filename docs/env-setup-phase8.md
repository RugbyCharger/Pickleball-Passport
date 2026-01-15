# Phase 8 Environment Variables

## Required for Cron Job

Add the following environment variable to Vercel project settings:

### CRON_SECRET

**Description**: Secret token used to authenticate cron job requests

**Required**: Yes (production and preview)

**Value**: Generate a secure random string (32+ characters)

**Example**:
```
CRON_SECRET=your-super-secure-random-string-here-32chars
```

**How to generate**:
```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Optional (Already Configured)

These should already be set up from previous phases:

### ADMIN_EMAIL

**Description**: Email address to receive admin alerts for failed payments

**Default**: `admin@pickleballpassport.com`

**Example**:
```
ADMIN_EMAIL=your-admin-email@example.com
```

### NEXT_PUBLIC_APP_URL

**Description**: Base URL of the application (for email links)

**Required**: Yes

**Example**:
```
NEXT_PUBLIC_APP_URL=https://pickleballpassport.com
```

---

## Vercel Setup Instructions

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `CRON_SECRET` for all environments (Production, Preview, Development)
4. Click **Save**
5. Redeploy the application for changes to take effect

---

## Local Development

For local testing, add to `.env.local`:

```
CRON_SECRET=local-development-secret-for-testing
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: `.env.local` is gitignored and should never be committed.

---

## Testing the Cron Job Locally

```bash
# Call the endpoint with authorization header
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
```

Expected response: JSON summary with processed payments
