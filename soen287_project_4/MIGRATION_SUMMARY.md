# Migration Summary: Cloudflare D1 → MySQL (XAMPP/phpMyAdmin)

## ✅ What Has Been Done

### 1. Database Schema Created
**File:** `database/mysql_schema.sql`
- Complete MySQL schema matching your D1 database structure
- All tables: users, pending_users, password_reset_tokens, resources, bookings, app_settings, booking_requests
- Sample data included (2 admin users, 14 resources)
- Proper indexes and foreign keys

### 2. PHP Backend Created
**Files:** 
- `src/server.php` - Main API server (authentication, profile, resources, bookings)
- `src/server_part2.php` - Additional endpoints (admin features, booking approval)
- `src/db.php` - Already existed, database connection class
- `src/config.php` - Updated with MySQL configuration
- `src/email-service.php` - Already existed, email functionality

### 3. Configuration Updated
**File:** `src/config.php`
- MySQL connection settings (localhost, root, no password, soen287_project)
- SendGrid API configuration (⚠️ **YOU NEED TO ADD YOUR KEY**)
- Base URL configuration
- CORS settings

### 4. Documentation Created
**Files:**
- `MIGRATION_GUIDE.md` - Complete step-by-step migration instructions
- `migration_helper.sh` - Automated setup script (executable)

## 🔄 What You Need To Do

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache**
3. Start **MySQL**

### Step 2: Create the Database
**Option A - Using phpMyAdmin (Recommended):**
1. Open `http://localhost/phpmyadmin`
2. Click "SQL" tab
3. Copy/paste entire contents of `database/mysql_schema.sql`
4. Click "Go"

**Option B - Using Command Line:**
```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
mysql -uroot < database/mysql_schema.sql
```

**Option C - Using Helper Script:**
```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
./migration_helper.sh
# Choose option 2 (Setup database)
```

### Step 3: Add Your SendGrid API Key
Edit `src/config.php` line 9:
```php
define('SENDGRID_API_KEY', 'SG.your_actual_key_here');
```

### Step 4: Merge Server Files
The API endpoints are split into two files. You need to merge them:

1. Open `src/server.php`
2. Find this comment near the end: `// Continue with Part 2...`
3. Open `src/server_part2.php` and copy all the route handlers (everything after the opening `<?php`)
4. Paste them into `server.php` **BEFORE** the `// Route not found` section
5. Save `server.php`
6. (Optional) Delete `server_part2.php`

### Step 5: Setup the Server

**Option A - XAMPP htdocs (Recommended):**
1. Copy your entire project to XAMPP's htdocs:
   - Mac: `/Applications/XAMPP/htdocs/soen287_project_2`
   - Windows: `C:\xampp\htdocs\soen287_project_2`

2. Create `.htaccess` file in project root:
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ src/server.php [QSA,L]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]
DirectoryIndex index.html
```

3. Access at: `http://localhost/soen287_project_2/`

**Option B - PHP Built-in Server (Quick Test):**
```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
php -S localhost:8080
```
Access at: `http://localhost:8080/`

### Step 6: Update Frontend API URLs

Find all JavaScript files that make API calls and update the base URL:

**Before (Cloudflare):**
```javascript
const API_URL = 'https://soen287-project-2.pages.dev/api';
```

**After (XAMPP htdocs with .htaccess):**
```javascript
const API_URL = 'http://localhost/soen287_project_2/api';
```

**After (PHP built-in server):**
```javascript
const API_URL = 'http://localhost:8080/src/server.php/api';
```

**Files to check:**
- Search for `fetch('/api` or `fetch("http` in all .html and .js files
- Common files: any JS with API calls, HTML files with inline scripts

### Step 7: Test Everything

1. **Health Check:**
   - `http://localhost/soen287_project_2/api/health`
   - Should return: `{"success":true,"message":"API is healthy",...}`

2. **Register a new user** - Should create entry in `pending_users`

3. **Check email** - Should receive verification email

4. **Verify email** - User should move to `users` table

5. **Login** - Should return user data with role

6. **Admin login:**
   - Email: `michaelkauzman2001@gmail.com`
   - Password: `admin123`

## 📊 Default Admin Users

| Email | Password | Role |
|-------|----------|------|
| michaelkauzman2001@gmail.com | admin123 | admin |
| staff@concordia.ca | admin123 | staff |

Password hash for "admin123": `4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9`

## 🔧 Troubleshooting Quick Fixes

**Database connection error:**
```bash
# Check MySQL is running in XAMPP
# Verify credentials in src/config.php match your MySQL setup
```

**404 errors on API calls:**
```bash
# Check Apache is running
# Verify .htaccess file exists
# Check mod_rewrite is enabled in httpd.conf
```

**CORS errors:**
```bash
# Verify src/server.php has CORS headers (it does)
# Check you're accessing from allowed origin
```

**Email not sending:**
```bash
# Verify SendGrid API key in src/config.php
# Check key has Mail Send permissions
# Verify sender email is verified in SendGrid
```

## 📁 New Files Created

```
/database/mysql_schema.sql          ← MySQL database schema
/src/server.php                     ← Main PHP API server
/src/server_part2.php               ← Additional API endpoints (needs merging)
/src/config.php                     ← Updated configuration (NEEDS YOUR SENDGRID KEY)
/MIGRATION_GUIDE.md                 ← Detailed migration instructions
/MIGRATION_SUMMARY.md               ← This file
/migration_helper.sh                ← Automated setup script
```

## 🎯 Migration Checklist

- [ ] XAMPP Apache started
- [ ] XAMPP MySQL started
- [ ] Database created using complete_setup_all_data.sql
- [ ] Bookings data imported using bookings_data.sql
- [ ] SendGrid API key added to config.php
- [x] ✅ **server_part2.php merged into server.php** - DONE!
- [ ] Project copied to XAMPP htdocs (manual step needed)
- [x] ✅ **.htaccess created** - DONE!
- [x] ✅ **Frontend API URLs updated** - DONE!
- [ ] Health endpoint tested
- [ ] Registration tested
- [ ] Email verification tested
- [ ] Login tested
- [ ] Admin login tested

---

**✅ Steps 4, 5, and 6 are COMPLETE!**
See `STEPS_4_5_6_COMPLETE.md` for details.

## 🚀 Next Steps After Migration

1. Test all features thoroughly
2. Export and import your existing D1 data (optional)
3. Update any deployment documentation
4. Consider version control (git) for the changes
5. Plan for production deployment when ready

## 📝 Notes

- **Database:** All your D1 tables are now in MySQL with proper relationships
- **API Endpoints:** All worker.js endpoints are now in server.php
- **Authentication:** Same password hashing (SHA-256) as before
- **Email:** Same SendGrid integration as before
- **CORS:** Properly configured for local development

## ⚠️ Important

1. **Don't forget to add your SendGrid API key to `src/config.php`!**
2. **Merge `server_part2.php` into `server.php` before testing!**
3. **Update frontend API URLs in all JavaScript files!**

---

**Need help?** Check the detailed `MIGRATION_GUIDE.md` or run `./migration_helper.sh` for automated setup.

