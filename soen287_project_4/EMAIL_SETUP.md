# Email Setup Guide for Password Reset

This guide explains how to set up email sending for the password reset functionality.

## Option 1: MailChannels (FREE - Recommended)

MailChannels provides free email sending for Cloudflare Workers without requiring an API key.

### Setup Steps:
1. **No API key required** - MailChannels works out of the box
2. **Update domain** in `src/email-service.js`:
   ```javascript
   from: {
     email: 'noreply@your-domain.com', // Change to your domain
     name: 'Concordia Student Services',
   }
   ```
3. **Update BASE_URL** in `wrangler.toml`:
   ```toml
   BASE_URL = "https://your-actual-domain.com"
   ```

### Pros:
- ✅ Completely free
- ✅ No API key setup required
- ✅ Good deliverability
- ✅ Works immediately

### Cons:
- ⚠️ Limited to Cloudflare Workers
- ⚠️ Basic email features only

## Option 2: SendGrid (Paid)

SendGrid is a popular email service with good deliverability.

### Setup Steps:
1. **Create SendGrid account** at [sendgrid.com](https://sendgrid.com)
2. **Get API key** from SendGrid dashboard
3. **Add API key as secret**:
   ```bash
   npx wrangler secret put SENDGRID_API_KEY
   ```
4. **Verify domain** in SendGrid dashboard
5. **Update domain** in `src/email-service.js`

### Pros:
- ✅ Excellent deliverability
- ✅ Advanced analytics
- ✅ Template management
- ✅ Free tier available (100 emails/day)

### Cons:
- ⚠️ Requires API key setup
- ⚠️ Domain verification needed
- ⚠️ Paid plans for higher volume

## Option 3: Resend (Modern Alternative)

Resend is a modern email API with great developer experience.

### Setup Steps:
1. **Create Resend account** at [resend.com](https://resend.com)
2. **Get API key** from Resend dashboard
3. **Add API key as secret**:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
4. **Verify domain** in Resend dashboard
5. **Update domain** in `src/email-service.js`

### Pros:
- ✅ Modern developer experience
- ✅ Good deliverability
- ✅ Simple setup
- ✅ Free tier (100 emails/day)

### Cons:
- ⚠️ Newer service
- ⚠️ Domain verification needed
- ⚠️ Paid plans for higher volume

## Quick Start (Using MailChannels)

1. **Update your domain** in `src/email-service.js`:
   ```javascript
   // Line 15
   email: 'noreply@concordia-student-services.com', // Change this
   ```

2. **Update your website URL** in `wrangler.toml`:
   ```toml
   BASE_URL = "https://your-cloudflare-pages-domain.pages.dev"
   ```

3. **Deploy the worker**:
   ```bash
   npm run worker:deploy
   ```

4. **Test the functionality** by requesting a password reset

## Fallback Strategy

The email service automatically falls back in this order:
1. **MailChannels** (primary - free)
2. **SendGrid** (if API key configured)
3. **Resend** (if API key configured)

## Environment Variables

Set these in `wrangler.toml` or as secrets:

```toml
[vars]
BASE_URL = "https://your-domain.com"

# Optional secrets (run: wrangler secret put SECRET_NAME)
# SENDGRID_API_KEY = "your-sendgrid-key"
# RESEND_API_KEY = "your-resend-key"
```

## Testing Email Delivery

1. **Deploy your worker**
2. **Go to your forgot password page**
3. **Enter a valid email from your database**
4. **Check the email inbox** (including spam folder)
5. **Click the reset link** to test the full flow

## Troubleshooting

### Email not received:
- Check spam/junk folder
- Verify the email address exists in your database
- Check worker logs for errors
- Ensure domain is correctly configured

### "Failed to send email" error:
- Check worker logs for specific error details
- Verify API keys are correctly set
- Ensure domain is verified with email provider
- Try a different email provider as fallback

### Reset link not working:
- Verify BASE_URL is correctly set
- Check that token hasn't expired (1 hour limit)
- Ensure reset-password.html page is accessible

## Security Considerations

- ✅ Tokens expire in 1 hour
- ✅ Tokens are single-use only
- ✅ Failed email attempts remove tokens
- ✅ Rate limiting recommended for production
- ✅ HTTPS required for secure token transmission

## Next Steps

1. Choose your email provider
2. Update configuration files
3. Deploy and test
4. Monitor email delivery rates
5. Set up domain authentication (SPF, DKIM) for better deliverability