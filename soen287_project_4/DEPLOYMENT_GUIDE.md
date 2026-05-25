# 🚀 Railway + Cloudflare Deployment Guide

## ✅ Repository Created!

**GitHub:** https://github.com/mkauzman/soen287_project_4
**Railway Project:** https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d

---

## 📦 Step 1: Deploy Backend to Railway

Railway CLI is installed. Now complete the setup:

### 1.1 Add MySQL Database

The `railway add` command is waiting for you. In your terminal:

1. **Select:** Use arrow keys to choose **"MySQL"**
2. **Confirm:** Press Enter

This creates a MySQL database in your Railway project.

### 1.2 Import Database Schema

After MySQL is added, import your database:

**🚀 Quick Method: Use Automated Script**

Run the import script:
```bash
./import_db_railway.sh
```

This automatically:
- Gets Railway MySQL credentials
- Imports `complete_setup_all_data.sql`
- Imports `bookings_data.sql`
- Verifies the import

---

**📖 Manual Method 1: Railway CLI Connect**

```bash
# Step 1: Connect to Railway MySQL
railway connect mysql

# Step 2: Once in MySQL shell (mysql> prompt), run:
source database/complete_setup_all_data.sql
source database/bookings_data.sql

# Step 3: Verify
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM resources;
SELECT COUNT(*) FROM bookings;

# Exit
exit
```

---

**📖 Manual Method 2: Direct MySQL Command**

```bash
# Step 1: Get MySQL credentials
railway variables

# You'll see:
# MYSQLHOST=containers-us-west-xxx.railway.app
# MYSQLPORT=7439
# MYSQLDATABASE=railway
# MYSQLUSER=root
# MYSQLPASSWORD=xxxxxxxxxxxxx

# Step 2: Import using mysql command (replace with your actual values)
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/complete_setup_all_data.sql

mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/bookings_data.sql
```


**Example:**
```bash
mysql -h containers-us-west-123.railway.app -P 7439 -u root -pYourPasswordHere railway < database/complete_setup_all_data.sql
```

**Note:** No space between `-p` and password!

### 1.3 Deploy Express.js Backend

```bash
railway up
```

This deploys your `server.js` to Railway.

### 1.4 Get Your Backend URL

```bash
railway domain
```

Or visit your Railway dashboard and copy the domain.

**You should get something like:**
`https://soen287project4-production.up.railway.app`

---

## 🌐 Step 2: Deploy Frontend to Cloudflare Pages

### 2.1 Update API URLs

First, update all HTML files to use your Railway backend URL.

**Find and replace in ALL HTML files:**

**Find:**
```javascript
http://localhost:3000/api
```

**Replace with:**
```javascript
https://YOUR-RAILWAY-URL.up.railway.app/api
```

**Files to update:**
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
- bookingRequests.html
- statistics.html

### 2.2 Commit Changes

```bash
git add .
git commit -m "Update API URLs to Railway backend"
git push origin main
```

### 2.3 Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name=soen287-booking-system
```

**Note:** First deployment will prompt you to login to Cloudflare.

**Or use Cloudflare Dashboard:**
1. Go to https://dash.cloudflare.com
2. Click **"Workers & Pages"** → **"Pages"**
3. Click **"Create application"** → **"Connect to Git"**
4. Select your **soen287_project_4** repository
5. **Build settings:**
   - Build command: (leave empty)
   - Build output directory: `/`
6. Click **"Save and Deploy"**

You'll get a URL like: `https://soen287-booking-system.pages.dev`

---

## ✅ Step 3: Test Deployment

### 3.1 Test Backend

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/health
```

Should return:
```json
{"success":true,"message":"API is healthy","timestamp":"..."}
```

### 3.2 Test Frontend

Visit: `https://soen287-booking-system.pages.dev`

Try:
- ✅ Home page loads
- ✅ Login works
- ✅ Register works
- ✅ Bookings work

### 3.3 Test Database Connection

Login with admin account:
- Email: `michaelkauzman2001@gmail.com`
- Password: `admin123`

If login works, database connection is successful!

---

## 🔧 Environment Variables (Railway)

Railway automatically sets these for MySQL:
- ✅ `MYSQLHOST`
- ✅ `MYSQLPORT`
- ✅ `MYSQLUSER`
- ✅ `MYSQLPASSWORD`
- ✅ `MYSQLDATABASE`

**Add SendGrid API Key (for emails):**

```bash
railway variables set SENDGRID_API_KEY=your_actual_sendgrid_key_here
```

Or via Railway Dashboard:
1. Go to your project
2. Click **"Variables"** tab
3. Add: `SENDGRID_API_KEY` = `your_key_here`

---

## 📊 Deployment Summary

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Cloudflare Pages | `https://soen287-booking-system.pages.dev` |
| **Backend** | Railway | `https://YOUR-APP.up.railway.app` |
| **Database** | Railway MySQL | Internal (managed by Railway) |
| **Code** | GitHub | https://github.com/mkauzman/soen287_project_4 |

---

## 🎯 Quick Commands Reference

```bash
# Railway commands
railway login          # Login to Railway
railway status         # Check deployment status
railway logs           # View backend logs
railway open           # Open Railway dashboard
railway variables      # View environment variables
railway domain         # Get backend URL

# Cloudflare commands
npx wrangler pages deploy . --project-name=soen287-booking-system

# Database access
railway connect mysql  # Connect to Railway MySQL
```

---

## 🔐 Access Railway MySQL Database

### Via Railway Dashboard:
1. Go to https://railway.com/project/61baad2b-dbd3-4821-a07d-42d89873dd8d
2. Click **MySQL** service
3. Click **"Data"** tab
4. Browse tables, run queries

### Via CLI:
```bash
railway connect mysql
```

This opens MySQL shell connected to your Railway database.

---

## 🚨 Troubleshooting

### Backend not working:
```bash
railway logs
```

### Frontend can't connect to backend:
- Check API URLs in HTML files
- Verify CORS is enabled in `server.js` (already done ✅)
- Check Railway backend URL is correct

### Database connection fails:
```bash
railway variables | grep MYSQL
```
Verify all MySQL variables are set.

### Email not sending:
```bash
railway variables set SENDGRID_API_KEY=your_key_here
```

---

## 📝 Next Steps

1. ✅ **Complete Railway MySQL setup** (in terminal now)
2. ✅ **Deploy backend:** `railway up`
3. ✅ **Get backend URL:** `railway domain`
4. ✅ **Update HTML files** with Railway URL
5. ✅ **Deploy frontend:** `npx wrangler pages deploy .`
6. ✅ **Test everything**

---

**Continue in your terminal to complete the Railway MySQL setup!** 🚀

The `railway add` command is waiting for you to select **MySQL**.

