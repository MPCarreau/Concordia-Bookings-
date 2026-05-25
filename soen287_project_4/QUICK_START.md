# 🚀 Quick Start Deployment

## ✅ What's Done

- ✅ GitHub repo created: https://github.com/mkauzman/soen287_project_4
- ✅ Railway project created: https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d
- ✅ Railway CLI installed

## 🎯 What You Need to Do (Simple Steps)

### Step 1: Add MySQL to Railway

In your terminal (where `railway add` is waiting):
1. Select **"MySQL"** (use arrow keys)
2. Press Enter

### Step 2: Import Database

Run the automated import script:
```bash
./import_db_railway.sh
```

Wait for "✅ All done!"

### Step 3: Deploy Backend

```bash
railway up
```

Wait for deployment to complete.

### Step 4: Get Backend URL

```bash
railway domain
```

Copy the URL you get (e.g., `https://soen287project4-production.up.railway.app`)

### Step 5: Update Frontend API URLs

Replace in ALL HTML files:
- **Find:** `http://localhost:3000/api`
- **Replace:** `https://YOUR-RAILWAY-URL.up.railway.app/api`

Quick command to do this:
```bash
# Replace YOUR_RAILWAY_URL with actual URL from step 4
find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://YOUR_RAILWAY_URL.up.railway.app/api|g' {} +
```

### Step 6: Commit & Push Changes

```bash
git add .
git commit -m "Update API URLs for Railway deployment"
git push origin main
```

### Step 7: Deploy Frontend to Cloudflare

```bash
npx wrangler pages deploy . --project-name=soen287-booking-system
```

Follow the prompts (login if needed).

### Step 8: Test!

Visit your Cloudflare Pages URL and try:
- ✅ Login with: `michaelkauzman2001@gmail.com` / `admin123`
- ✅ Make a booking
- ✅ View your bookings

---

## 🎉 Done!

Your app is now live:
- **Frontend:** `https://soen287-booking-system.pages.dev`
- **Backend:** `https://YOUR-RAILWAY-URL.up.railway.app`

---

## 📚 Need More Details?

See `DEPLOYMENT_GUIDE.md` for complete documentation.

## 🚨 Troubleshooting

**Database import fails?**
```bash
railway connect mysql
# Then manually run SQL files
```

**Backend not working?**
```bash
railway logs
```

**Frontend can't connect?**
- Check API URLs in HTML files
- Verify Railway URL is correct

---

**Continue in your terminal to select MySQL!** ⬆️

