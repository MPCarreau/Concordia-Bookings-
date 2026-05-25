# Quick Email Fix - Set Up SendGrid

The MailChannels service is returning "401 Authorization Required" because it requires domain verification or specific Cloudflare configuration. Let's set up SendGrid instead, which is more reliable.

## Option 1: Free SendGrid Setup (100 emails/day)

### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key
1. Log into SendGrid dashboard
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Choose "Restricted Access"
5. Give it permissions for "Mail Send" 
6. Copy the API key (starts with "SG.")

### Step 3: Add API Key to Your Worker
```bash
cd /Users/michael/soen287-2
npx wrangler secret put SENDGRID_API_KEY
# Paste your API key when prompted
```

### Step 4: Update Sender Email
Update the sender email in `/src/email-service.js` line 51:
```javascript
from: {
  email: 'noreply@your-verified-domain.com', // Use your verified domain
  name: 'SOEN 287 Project',
},
```

### Step 5: Deploy and Test
```bash
npm run worker:deploy
```

## Option 2: Use Gmail SMTP (Alternative)

If SendGrid doesn't work, we can set up Gmail SMTP:

1. Enable 2-factor authentication on your Gmail
2. Generate an App Password
3. Use Gmail SMTP configuration

## Option 3: Use Resend (Modern Alternative)

1. Go to [resend.com](https://resend.com)
2. Free tier: 100 emails/day
3. Similar setup to SendGrid

## Current Status

- ✅ Email service code is ready
- ❌ MailChannels requires domain verification
- ⏳ Need to set up SendGrid API key
- ⏳ Need to verify sender domain

## Next Steps

1. **Choose SendGrid** (recommended)
2. **Get API key** and add it as a secret
3. **Test email delivery**
4. **Verify domain** for better deliverability (optional)

Would you like me to help you set up SendGrid or try a different email service?