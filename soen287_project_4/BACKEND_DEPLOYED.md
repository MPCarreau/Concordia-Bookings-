# 🎉 BACKEND DEPLOYED TO RAILWAY!

## ✅ Deployment Status: COMPLETE

Your Express.js backend has been successfully deployed to Railway!

---

## 📊 What Was Deployed:

- ✅ Express.js server (`server.js`)
- ✅ All API endpoints (authentication, bookings, admin features)
- ✅ Connected to Railway MySQL database
- ✅ Node.js 18.20.5
- ✅ All dependencies installed

---

## 🔗 Get Your Backend URL

### Method 1: Via Railway Dashboard (Opened in Browser)

1. Look at your Railway dashboard (just opened)
2. Click on your **app service** (not MySQL)
3. Go to **"Settings"** tab
4. Scroll to **"Domains"**
5. You'll see a domain like: `soen287project4-production.up.railway.app`
6. **Copy this URL**

### Method 2: Via CLI

```bash
# Switch to app service
railway service

# Get domain
railway domain
```

---

## 🚀 NEXT STEPS

### Step 1: Get Backend URL

From Railway dashboard, copy your backend URL.

**Example:** `https://soen287project4-production.up.railway.app`

### Step 2: Update Frontend API URLs

Run this command (replace with YOUR actual Railway URL):

```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_4

# Replace YOUR_RAILWAY_URL with actual URL (without https://)
find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://YOUR_RAILWAY_URL.up.railway.app/api|g' {} +
```

**Example:**
```bash
find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://soen287project4-production.up.railway.app/api|g' {} +
```

### Step 3: Commit Changes

```bash
git add .
git commit -m "Update API URLs to Railway backend"
git push origin main
```

### Step 4: Deploy Frontend to Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name=soen287-booking-system
```

Follow the prompts (login if needed).

### Step 5: Test!

After Cloudflare deployment:

1. **Visit your Cloudflare Pages URL** (you'll get it after deployment)
2. **Test API health:**
   - Visit: `https://YOUR_RAILWAY_URL.up.railway.app/api/health`
   - Should see: `{"success":true,"message":"API is healthy"...}`
3. **Test login:**
   - Email: `michaelkauzman2001@gmail.com`
   - Password: `admin123`

---

## 📝 Quick Reference

### Backend (Railway):
```
URL: https://YOUR_RAILWAY_URL.up.railway.app
API: https://YOUR_RAILWAY_URL.up.railway.app/api
Health Check: https://YOUR_RAILWAY_URL.up.railway.app/api/health
```

### Frontend (Cloudflare Pages):
```
URL: https://soen287-booking-system.pages.dev (or custom)
```

### Database (Railway MySQL):
```
Host: maglev.proxy.rlwy.net
Port: 15158
Database: railway
User: root
```

---

## 🧪 Test Backend Now

Once you have your Railway URL, test it:

```bash
# Replace with your actual URL
curl https://YOUR_RAILWAY_URL.up.railway.app/api/health

# Should return:
# {"success":true,"message":"API is healthy","timestamp":"..."}
```

---

## 🎯 Files That Need URL Updates

These HTML files reference the API:

- index.html
- login.html
- register.html
- verify-email.html
- forgot-password.html
- reset-password.html
- profile.html
- bookings.html
- makeBooking.html
- bookingRequests.html
- adminSchedule.html
- statistics.html

**All will be updated with the `find` command above!**

---

## 🔧 Troubleshooting

### Backend not responding?
```bash
# Check logs
railway logs

# Restart service
railway restart
```

### Can't find Railway URL?
1. Go to https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d
2. Click on your app service
3. Settings → Domains

### API returns 404?
- Make sure backend is fully deployed (check Railway dashboard)
- Verify environment variables are set (MySQL credentials)

---

## 📚 Summary

| Step | Status |
|------|--------|
| MySQL Database | ✅ Imported |
| Express Backend | ✅ Deployed |
| Get Backend URL | ⏳ In Progress (check dashboard) |
| Update Frontend URLs | ⏳ TODO |
| Deploy to Cloudflare | ⏳ TODO |
| Test | ⏳ TODO |

---

**Get your Railway URL from the dashboard, then follow Step 2 above!** 🚀

