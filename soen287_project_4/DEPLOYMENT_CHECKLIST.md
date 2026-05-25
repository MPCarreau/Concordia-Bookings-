# 🚀 COMPLETE DEPLOYMENT CHECKLIST

## ✅ Completed So Far

- [x] Created GitHub repo: soen287_project_4
- [x] Created Railway project
- [x] Installed MySQL client
- [x] Created MySQL database on Railway
- [x] Imported all database tables and data:
  - [x] 9 users
  - [x] 20 resources
  - [x] 126 bookings
  - [x] 18 booking requests
- [x] Updated server.js for Railway compatibility
- [x] Pushed code to GitHub

## ⏳ TO DO NOW - Deploy Backend

**Current Issue:** App service doesn't exist yet (only MySQL exists)

**Solution:** Use Railway Dashboard to connect GitHub repo

### Step-by-Step:

1. **Open Railway Dashboard:**
   - URL: https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d

2. **Click "+ New" button** (top right corner)

3. **Select "GitHub Repo"**

4. **Choose "soen287_project_4"** from your repositories

5. **Railway auto-deploys** - wait for build to complete (~2-3 minutes)

6. **Configure MySQL variables:**
   - Click on your new app service
   - Variables tab → "+ New Variable" → "Reference"
   - Select MySQL service
   - Add all 5 MySQL variables
   - Service will auto-redeploy

7. **Generate public domain:**
   - Settings tab → Networking section
   - Click "Generate Domain"
   - **Copy this URL!** (e.g., `soen287project4-production.up.railway.app`)

8. **Test backend:**
   ```bash
   curl https://YOUR-DOMAIN.up.railway.app/api/health
   ```
   Should return: `{"success":true,"message":"API is healthy"...}`

---

## ⏳ TO DO NEXT - Deploy Frontend

Once you have your Railway backend URL:

### Step 1: Update API URLs in HTML files

```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_4

# Replace YOUR_DOMAIN with actual Railway domain (without https://)
find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://YOUR_DOMAIN.up.railway.app/api|g' {} +
```

**Example:**
```bash
find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://soen287project4-production.up.railway.app/api|g' {} +
```

### Step 2: Commit changes

```bash
git add .
git commit -m "Update API URLs to Railway backend"
git push origin main
```

### Step 3: Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name=soen287-booking-system
```

If prompted:
- Login to Cloudflare
- Authorize Wrangler
- Choose account
- Confirm deployment

### Step 4: Get Cloudflare URL

After deployment completes, you'll see:
```
✨ Success! Uploaded X files
🌎 Your site is deployed at: https://soen287-booking-system.pages.dev
```

---

## ✅ Final Testing

1. **Test Backend API:**
   ```bash
   curl https://YOUR-RAILWAY-URL.up.railway.app/api/health
   curl https://YOUR-RAILWAY-URL.up.railway.app/api/resources
   ```

2. **Test Frontend:**
   - Visit: `https://soen287-booking-system.pages.dev`
   - Try to login:
     - Email: `michaelkauzman2001@gmail.com`
     - Password: `admin123`
   - Make a test booking
   - Check admin features

3. **Test Full Flow:**
   - Register new account
   - Verify email (check logs if email doesn't send)
   - Login
   - Browse resources
   - Make booking
   - View bookings
   - Cancel booking

---

## 📊 Architecture Overview

```
User Browser
    ↓
Cloudflare Pages (Frontend)
https://soen287-booking-system.pages.dev
    ↓ API Calls
Railway Backend (Express.js)
https://YOUR-DOMAIN.up.railway.app
    ↓ Database Queries
Railway MySQL (Database)
Internal: mysql.railway.internal:3306
External: maglev.proxy.rlwy.net:15158
```

---

## 🔗 Important URLs

| Service | URL/Command |
|---------|-------------|
| **Railway Project** | https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d |
| **GitHub Repo** | https://github.com/mkauzman/soen287_project_4 |
| **Backend API** | `https://YOUR-DOMAIN.up.railway.app` (get from Railway) |
| **Frontend** | `https://soen287-booking-system.pages.dev` (get from Cloudflare) |
| **Check Backend** | `curl https://YOUR-DOMAIN.up.railway.app/api/health` |

---

## 🔐 Admin Credentials

Test these after deployment:

| Email | Password | Role |
|-------|----------|------|
| michaelkauzman2001@gmail.com | admin123 | admin |
| phoenix93127@gmail.com | (original password) | admin |
| micahpcarreau@hotmail.com | (original password) | admin |
| nadezhdagagnon@gmail.com | (original password) | admin |

---

## 🐛 Troubleshooting

### Backend issues:
```bash
railway logs --tail 100
```

### Frontend API connection issues:
- Check browser console (F12) for errors
- Verify API URL is correct in HTML files
- Check CORS is enabled (it is in server.js)

### Database connection issues:
- Verify MySQL variables are linked in Railway
- Check Railway MySQL service is running
- Test connection from backend logs

---

## 📝 Quick Commands Reference

```bash
# Check Railway logs
railway logs

# Check Railway status
railway status

# Test backend health
curl https://YOUR-DOMAIN.up.railway.app/api/health

# Update frontend URLs (replace YOUR_DOMAIN)
find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://YOUR_DOMAIN.up.railway.app/api|g' {} +

# Deploy to Cloudflare
npx wrangler pages deploy . --project-name=soen287-booking-system
```

---

## 🎯 Current Task

**You are here:** Need to deploy backend via Railway Dashboard

**Next action:** 
1. Open https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d
2. Click "+ New" → "GitHub Repo" → Select soen287_project_4
3. Wait for deployment
4. Link MySQL variables
5. Generate domain
6. Copy domain URL
7. Report back with the URL!

---

**GO TO RAILWAY DASHBOARD NOW AND DEPLOY!** 🚀

