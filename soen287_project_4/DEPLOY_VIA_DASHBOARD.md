# Railway Backend Deployment - Complete Guide

## Current Status
- ✅ MySQL database created and populated on Railway
- ✅ GitHub repo exists: https://github.com/mkauzman/soen287_project_4
- ❌ App service not yet deployed (CLI issues)

## Solution: Deploy via Railway Dashboard

### Step 1: Access Railway Dashboard
Go to: https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d

### Step 2: Create New Service from GitHub

1. Click **"+ New"** button (top right)
2. Select **"GitHub Repo"**
3. If prompted to connect GitHub:
   - Click "Configure GitHub App"
   - Authorize Railway
   - Select your repositories
4. Choose repository: **soen287_project_4**
5. Click **"Add Variables"** or **"Deploy"**

### Step 3: Configure Environment Variables

After the service is created:

1. Click on the new **app service** (not MySQL)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Select **"Reference"** 
5. Choose **MySQL** from the dropdown
6. Select ALL MySQL variables:
   - ✅ MYSQLHOST
   - ✅ MYSQLPORT
   - ✅ MYSQLUSER
   - ✅ MYSQLPASSWORD
   - ✅ MYSQLDATABASE
7. Click **"Add"**

### Step 4: Generate Public Domain

1. In your app service, go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the domain (e.g., `soen287project4-production.up.railway.app`)

### Step 5: Verify Deployment

Test your backend:
```bash
curl https://YOUR-DOMAIN.up.railway.app/api/health
```

Should return:
```json
{"success":true,"message":"API is healthy","timestamp":"..."}
```

---

## Alternative: Use Railway Template

If GitHub connection doesn't work:

1. In Railway Dashboard, click **"+ New"**
2. Select **"Empty Service"**
3. Once created, go to **"Settings"**
4. Scroll to **"Source"**
5. Click **"Connect Repo"**
6. Select **soen287_project_4**
7. Follow steps 3-5 above

---

## What Railway Will Auto-Detect

When you connect the GitHub repo, Railway will:
- ✅ Detect Node.js project
- ✅ Run `npm install`
- ✅ Run `npm start`
- ✅ Build with nixpacks
- ✅ Expose the service publicly

---

## Expected Deployment Flow

1. **Building** - Railway installs dependencies
2. **Starting** - Railway runs `npm start`
3. **Logs show:**
   ```
   🚀 Express server running on http://localhost:XXXX
   📊 API endpoints available at http://localhost:XXXX/api
   ```
4. **Status:** ✅ Healthy

---

## Troubleshooting

### If build fails:
- Check logs in Railway dashboard
- Ensure `package.json` has `"type": "module"`
- Ensure `start` script is `"node server.js"`

### If server crashes:
- Verify MySQL variables are linked
- Check Railway logs for specific errors
- Ensure PORT is not manually set to 3306

### If can't connect to database:
- Verify all 5 MySQL variables are present
- Check MySQL service is running
- Verify database has data: `SELECT COUNT(*) FROM users;`

---

## After Successful Deployment

Once you have your Railway URL (e.g., `https://soen287project4-production.up.railway.app`):

1. **Update Frontend API URLs:**
   ```bash
   cd /Users/michaelkauzman/WebstormProjects/soen287_project_4
   find . -name "*.html" -type f -exec sed -i '' 's|http://localhost:3000/api|https://YOUR-DOMAIN.up.railway.app/api|g' {} +
   ```

2. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Update API URLs to Railway backend"
   git push origin main
   ```

3. **Deploy Frontend to Cloudflare:**
   ```bash
   npx wrangler pages deploy . --project-name=soen287-booking-system
   ```

---

## Quick Checklist

- [ ] Go to Railway Dashboard
- [ ] Create new service from GitHub repo
- [ ] Link MySQL variables to app service
- [ ] Generate public domain
- [ ] Test /api/health endpoint
- [ ] Update frontend API URLs
- [ ] Deploy frontend to Cloudflare Pages

---

**Start with Step 1 - Go to the Railway Dashboard now!**

Dashboard: https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d

