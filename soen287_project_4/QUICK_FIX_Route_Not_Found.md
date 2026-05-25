# 🔧 QUICK FIX for "Route not found" Error

## The Problem
Your server.php is receiving the path as `/soen287_project_2/api/health` but looking for `/api/health`.

## The Solution (Already Applied to Your Project)

I've already fixed both files in your project directory. You just need to copy them to XAMPP htdocs.

### Changes Made:

#### 1. Fixed `server.php` (line 65)
**Added this line to strip the project folder prefix:**
```php
// Strip the project folder prefix if present
$path = preg_replace('#^/soen287_project_2#', '', $path);
```

#### 2. Fixed `.htaccess`
**Simplified the rewrite rules:**
```apache
RewriteEngine On
RewriteBase /soen287_project_2/

# Route API requests to server.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ src/server.php [QSA,L]

# Default to index.html
DirectoryIndex index.html
```

---

## 🚀 How to Apply the Fix

### Option 1: Copy the Entire Fixed Project (Recommended)
```bash
# Run this command in Terminal and enter your password when prompted:
sudo cp -R /Users/michaelkauzman/WebstormProjects/soen287_project_2 /Applications/XAMPP/xamppfiles/apache2/htdocs/
```

**If it asks "overwrite?", type `y` and press Enter for each file.**

### Option 2: Copy Just the Fixed Files
```bash
# Copy fixed server.php
sudo cp /Users/michaelkauzman/WebstormProjects/soen287_project_2/src/server.php /Applications/XAMPP/xamppfiles/apache2/htdocs/soen287_project_2/src/

# Copy fixed .htaccess
sudo cp /Users/michaelkauzman/WebstormProjects/soen287_project_2/.htaccess /Applications/XAMPP/xamppfiles/apache2/htdocs/soen287_project_2/
```

### Option 3: Manual Edit (If Copy Doesn't Work)

**Edit `/Applications/XAMPP/xamppfiles/apache2/htdocs/soen287_project_2/src/server.php`:**

Find this section (around line 60-66):
```php
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Route handling
try {
```

**Change it to:**
```php
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Strip the project folder prefix if present
$path = preg_replace('#^/soen287_project_2#', '', $path);

// Route handling
try {
```

**Edit `/Applications/XAMPP/xamppfiles/apache2/htdocs/soen287_project_2/.htaccess`:**

Replace entire content with:
```apache
RewriteEngine On
RewriteBase /soen287_project_2/

# Route API requests to server.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ src/server.php [QSA,L]

# Default to index.html
DirectoryIndex index.html
```

---

## ✅ After Applying the Fix

1. **Restart Apache** in XAMPP Control Panel (Click "Stop" then "Start")
2. **Test again:** Open in browser: `http://localhost/soen287_project_2/api/health`

You should now see:
```json
{"success":true,"message":"API is healthy","timestamp":"2025-11-21 ..."}
```

---

## 🔍 Verification Tests

**Test these URLs in your browser:**
- ✅ `http://localhost/soen287_project_2/` - Should show home page
- ✅ `http://localhost/soen287_project_2/api/health` - Should show JSON health message
- ✅ `http://localhost/soen287_project_2/login.html` - Should show login page
- ✅ `http://localhost/soen287_project_2/api/resources` - Should show resources list JSON

All should work now!

---

## 📝 What This Fix Does

The fix adds a single line that strips `/soen287_project_2` from the beginning of the path, so:

**Before Fix:** 
- Browser requests: `/soen287_project_2/api/health`
- server.php receives: `/soen287_project_2/api/health`
- Checks against routes: `/api/health` ❌ **No match!**
- Result: "Route not found"

**After Fix:**
- Browser requests: `/soen287_project_2/api/health`
- server.php receives: `/soen287_project_2/api/health`
- **Strips to:** `/api/health`
- Checks against routes: `/api/health` ✅ **Match!**
- Result: Returns JSON response

---

## 💡 Quick Command (Just Run This)

Open Terminal and run:
```bash
sudo cp -R /Users/michaelkauzman/WebstormProjects/soen287_project_2 /Applications/XAMPP/xamppfiles/apache2/htdocs/
```

When it asks for your password, type it and press Enter.  
When it asks "overwrite?", type `y` and press Enter.

Then restart Apache in XAMPP and test!

---

**That's it! The fix is simple and already done in your project files.** 🎉

