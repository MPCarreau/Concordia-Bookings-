# Migration Guide: Cloudflare D1 to MySQL (XAMPP/phpMyAdmin)

This guide will help you migrate your SOEN287 project from Cloudflare Workers + D1 to PHP + MySQL using XAMPP.

## Prerequisites

1. ✅ **XAMPP installed** - You mentioned you have this
2. ✅ **phpMyAdmin installed** - You mentioned you have this
3. ✅ **SendGrid API Key** - For email functionality (same as before)

## Migration Steps

### Step 1: Start XAMPP Services

1. Open XAMPP Control Panel
2. Start **Apache** (for PHP)
3. Start **MySQL** (for database)

### Step 2: Create the MySQL Database

1. Open phpMyAdmin in your browser: `http://localhost/phpmyadmin`
2. Click on **"SQL"** tab at the top
3. Copy and paste the entire contents of `/database/mysql_schema.sql`
4. Click **"Go"** to execute

This will:
- Create the `soen287_project` database
- Create all necessary tables (users, pending_users, resources, bookings, etc.)
- Insert sample data including admin users and resources

### Step 3: Export Data from Cloudflare D1 (Optional)

If you want to preserve your existing user data from Cloudflare:

```bash
# Export users
npx wrangler d1 execute db-soen287-1 --remote --command "SELECT * FROM users" > d1_users_export.txt

# Export resources (if you have custom ones)
npx wrangler d1 execute db-soen287-1 --remote --command "SELECT * FROM resources" > d1_resources_export.txt

# Export bookings (if you want to preserve them)
npx wrangler d1 execute db-soen287-1 --remote --command "SELECT * FROM bookings" > d1_bookings_export.txt
```

**Note:** You'll need to manually format and insert this data into MySQL using phpMyAdmin's "Insert" feature or by creating SQL INSERT statements.

### Step 4: Configure the Application

1. **Update `src/config.php`:**
   - The file has already been updated with correct MySQL settings
   - **IMPORTANT:** Replace `YOUR_SENDGRID_API_KEY_HERE` with your actual SendGrid API key
   - Adjust `BASE_URL` if needed (default is `http://localhost:8080`)

```php
define('SENDGRID_API_KEY', 'SG.xxxxxxxxxxxxxxxxxxxxx'); // Your actual key
define('BASE_URL', 'http://localhost:8080'); // Your frontend URL
```

2. **Verify `src/db.php`** - Already configured correctly

3. **Verify `src/email-service.php`** - Already set up

### Step 5: Set Up the PHP Server

You have two options:

#### Option A: Use XAMPP's htdocs (Recommended)

1. Copy your project folder to XAMPP's `htdocs` directory:
   - Windows: `C:\xampp\htdocs\soen287_project_2`
   - Mac: `/Applications/XAMPP/htdocs/soen287_project_2`

2. Access your application at: `http://localhost/soen287_project_2/`

3. **Create .htaccess file** in your project root:

```apache
# .htaccess
RewriteEngine On

# Route API requests to server.php
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ src/server.php [QSA,L]

# Allow direct access to HTML, CSS, JS, and images
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Default to index.html
DirectoryIndex index.html
```

#### Option B: Use PHP Built-in Server (Development Only)

1. Navigate to your project directory:
```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
```

2. Start PHP server:
```bash
php -S localhost:8080
```

3. For API routing, you'll need to update all frontend JavaScript files to point to:
   - API: `http://localhost:8080/src/server.php`

### Step 6: Update Frontend API Calls

You need to update the API endpoint in all your JavaScript files. The API base URL should change from:

**Before (Cloudflare Worker):**
```javascript
const API_URL = 'https://soen287-project-2.pages.dev/api';
```

**After (PHP Server):**

If using XAMPP htdocs with .htaccess:
```javascript
const API_URL = 'http://localhost/soen287_project_2/api';
```

If using PHP built-in server:
```javascript
const API_URL = 'http://localhost:8080/src/server.php/api';
```

**Files that likely need updates:**
- Any JavaScript files with `fetch()` calls to `/api/`
- Check: `darkmode.js`, `static/registerBlock.js`, inline scripts in HTML files

### Step 7: Merge server_part2.php into server.php

The booking and admin endpoints are in `src/server_part2.php`. You need to merge them into `src/server.php`:

1. Open `src/server.php`
2. Find the line that says `// Continue with Part 2...`
3. Copy all the route handlers from `src/server_part2.php` 
4. Paste them BEFORE the `// Route not found` section in `server.php`
5. Delete the `src/server_part2.php` file (or keep it as reference)

### Step 8: Test the Migration

1. **Test Database Connection:**
   ```
   http://localhost/soen287_project_2/src/server.php/api/health
   ```
   Should return: `{"success":true,"message":"API is healthy","timestamp":"..."}`

2. **Test Registration:**
   - Go to register page
   - Create a new account
   - Check phpMyAdmin → `pending_users` table

3. **Test Email Verification:**
   - Check your email for verification link
   - Click the link
   - User should move from `pending_users` to `users` table

4. **Test Login:**
   - Login with verified account
   - Should receive user data with role

5. **Test Admin Login:**
   - Email: `michaelkauzman2001@gmail.com`
   - Password: `admin123`
   - Should login successfully with admin role

### Step 9: Admin Users Setup

The migration script includes two default admin users:

| Email | Password | Role |
|-------|----------|------|
| michaelkauzman2001@gmail.com | admin123 | admin |
| staff@concordia.ca | admin123 | staff |

**To add more admin users**, run this SQL in phpMyAdmin:

```sql
USE soen287_project;

-- Update existing user to admin
UPDATE users SET role = 'admin' WHERE id = 7;
UPDATE users SET role = 'admin' WHERE id = 8;

-- Or insert new admin user
INSERT INTO users (first_name, last_name, email, phone_number, password_hash, role, email_verified, email_verified_at)
VALUES ('Your', 'Name', 'your@email.com', '514-123-4567', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'admin', TRUE, NOW());
```

Note: The password hash `4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9` = "admin123"

## API Endpoints Comparison

All endpoints from worker.js have been migrated to server.php:

### Authentication
- ✅ POST `/api/register` - User registration
- ✅ POST `/api/verify-email` - Email verification
- ✅ POST `/api/login` - User login
- ✅ POST `/api/admin/login` - Admin login
- ✅ POST `/api/forgot-password` - Request password reset
- ✅ POST `/api/reset-password` - Reset password
- ✅ GET `/api/user/role` - Get user role
- ✅ PUT `/api/update-profile` - Update user profile

### Resources & Bookings
- ✅ GET `/api/resources` - Get all resources
- ✅ GET `/api/bookings` - Get bookings by date/category
- ✅ POST `/api/bookings` - Create booking
- ✅ GET `/api/user-bookings` - Get user's bookings
- ✅ POST `/api/cancel-booking` - Cancel booking
- ✅ POST `/api/toggle-maintenance` - Block/unblock slots

### Admin Features
- ✅ GET `/api/booking-approval-mode` - Get approval mode status
- ✅ POST `/api/booking-approval-mode` - Set approval mode
- ✅ GET `/api/pending-booking-requests` - Get all pending requests
- ✅ GET `/api/user-pending-booking-requests` - Get user's pending requests
- ✅ POST `/api/approve-booking-request` - Approve request
- ✅ POST `/api/reject-booking-request` - Reject request

### Utility
- ✅ GET `/api/health` - Health check

## Troubleshooting

### Database Connection Issues

**Error:** "Connection failed: Access denied"
- Check MySQL is running in XAMPP
- Verify credentials in `src/config.php` (default: root with no password)

**Error:** "Unknown database 'soen287_project'"
- Database wasn't created. Run the `mysql_schema.sql` script in phpMyAdmin

### Apache/PHP Issues

**Error:** "404 Not Found" on API calls
- Check Apache is running in XAMPP
- Verify `.htaccess` file exists and mod_rewrite is enabled
- Check file permissions

**Enable mod_rewrite in XAMPP:**
1. Open `xampp/apache/conf/httpd.conf`
2. Find line: `#LoadModule rewrite_module modules/mod_rewrite.so`
3. Remove the `#` to uncomment it
4. Restart Apache

### CORS Issues

**Error:** "CORS policy blocked"
- Check `src/server.php` has correct CORS headers (already included)
- Verify your frontend URL is accessing the correct API endpoint

### Email Issues

**Error:** "Failed to send verification email"
- Check your SendGrid API key is correct in `src/config.php`
- Verify the key has "Mail Send" permissions in SendGrid dashboard
- Check SendGrid sender email is verified

## Differences from Cloudflare Setup

| Feature | Cloudflare Worker | PHP/MySQL |
|---------|------------------|-----------|
| Database | D1 (SQLite) | MySQL |
| Runtime | Edge Workers | PHP 7.4+ |
| Hosting | Cloudflare Pages | XAMPP (Local) |
| API Format | Worker fetch handler | PHP REST API |
| Deployment | Wrangler CLI | Copy to htdocs |
| Environment Variables | wrangler.toml | config.php |

## Next Steps

1. ✅ Database created
2. ✅ Config files updated  
3. ⬜ Merge server_part2.php into server.php
4. ⬜ Update frontend API URLs
5. ⬜ Test all endpoints
6. ⬜ Add your SendGrid API key
7. ⬜ Test email functionality

## Advantages of This Setup

1. **Full control** - Everything runs locally on your machine
2. **Easy debugging** - PHP errors show immediately
3. **Fast development** - No deployment wait times
4. **Standard stack** - PHP + MySQL is widely used and documented
5. **phpMyAdmin** - Easy database management with GUI
6. **Free** - No cloud costs

## Production Deployment (Future)

When ready to deploy to production, you can:

1. **Hosting options:**
   - Any shared hosting with PHP + MySQL (Hostinger, BlueHost, etc.)
   - VPS (DigitalOcean, Linode)
   - Cloud (AWS, Google Cloud, Azure)

2. **Steps:**
   - Upload files via FTP/SFTP
   - Import `mysql_schema.sql` to production database
   - Update `config.php` with production database credentials
   - Update `BASE_URL` to your domain

## Need Help?

Common issues and solutions are in the Troubleshooting section above. If you encounter issues:

1. Check XAMPP error logs: `xampp/apache/logs/error_log`
2. Check PHP errors in browser console
3. Check database connection in phpMyAdmin
4. Verify all files are in the correct location

---

**Migration completed! 🎉**

Your application should now be running on PHP + MySQL instead of Cloudflare Workers + D1.

