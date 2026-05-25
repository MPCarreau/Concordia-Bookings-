# 🚨 TROUBLESHOOTING: "Route not found" Error

## Quick Fix - Run This Command

```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
./auto_fix.sh
```

This will automatically find and update your deployed server.php file.

---

## The Problem

You're getting:
```json
{"success":false,"error":"Route not found","path":"/soen287_project_2/api/health","method":"GET"}
```

This means:
1. ✅ Apache IS running
2. ✅ PHP IS running  
3. ✅ server.php IS being executed
4. ❌ The path isn't being matched correctly

---

## The Root Cause

Your server.php needs to strip the `/soen287_project_2` prefix from paths.

**I've UPDATED the fix** to be more robust. The new version strips ANY prefix before `/api`, so it will work no matter where you deploy it.

---

## Solution: Update Your Deployed server.php

### Method 1: Use Auto-Fix Script (Easiest)

```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
sudo ./auto_fix.sh
```

Enter your password when prompted. The script will find and update your deployed server.php automatically.

---

### Method 2: Manual Find & Copy

**Step 1:** Find where you deployed the project:
```bash
# Check common XAMPP locations
ls /Applications/XAMPP/htdocs/soen287_project_2/
ls /Applications/XAMPP/xamppfiles/htdocs/soen287_project_2/
ls /Applications/XAMPP/xamppfiles/apache2/htdocs/soen287_project_2/
```

**Step 2:** Once you find it, copy the fixed file:
```bash
# Replace /PATH/TO/HTDOCS with your actual htdocs path
sudo cp /Users/michaelkauzman/WebstormProjects/soen287_project_2/src/server.php /PATH/TO/HTDOCS/soen287_project_2/src/
```

---

### Method 3: Direct Edit

If you can't copy, edit the deployed server.php directly.

**Find this section (around line 60-68):**
```php
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Route handling
try {
```

**Replace with:**
```php
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Strip any prefix before /api or use as-is if no /api
if (strpos($path, '/api') !== false) {
    $path = substr($path, strpos($path, '/api'));
}

// Route handling
try {
```

---

## After Applying the Fix

1. **Restart Apache** in XAMPP Control Panel
2. **Clear browser cache** (Cmd+Shift+R on Mac)
3. **Test:** `http://localhost/soen287_project_2/api/health`

Expected result:
```json
{"success":true,"message":"API is healthy","timestamp":"2025-11-21 ..."}
```

---

## Debugging: Find Your Deployed Location

If you're not sure where the project is deployed, run these commands:

```bash
# Method 1: Search for server.php
find /Applications -name "server.php" -path "*/soen287_project_2/*" 2>/dev/null

# Method 2: Search for the project folder
find /Applications -name "soen287_project_2" -type d 2>/dev/null

# Method 3: Check XAMPP config
grep "DocumentRoot" /Applications/XAMPP/*/etc/httpd.conf 2>/dev/null | grep -v "^#"
```

---

## Verify the Fix Was Applied

After copying, check if the fix is in place:

```bash
# Replace /PATH/TO/HTDOCS with your actual path
grep -A 3 "Strip any prefix" /PATH/TO/HTDOCS/soen287_project_2/src/server.php
```

Should show:
```php
// Strip any prefix before /api or use as-is if no /api
if (strpos($path, '/api') !== false) {
    $path = substr($path, strpos($path, '/api'));
}
```

---

## Still Not Working?

### Check 1: Is Apache using the right directory?

```bash
# Check Apache config
grep "DocumentRoot" /Applications/XAMPP/*/etc/httpd.conf 2>/dev/null
```

### Check 2: Check PHP errors

Add this at the top of server.php (right after `<?php`):
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

### Check 3: Check Apache error log

```bash
tail -f /Applications/XAMPP/*/logs/error_log
```

Then refresh `http://localhost/soen287_project_2/api/health` and watch for errors.

### Check 4: Test server.php directly

```bash
curl -v http://localhost/soen287_project_2/src/server.php
```

Should show PHP output or error.

---

## Quick Test Commands

```bash
# Test health endpoint
curl http://localhost/soen287_project_2/api/health

# Test resources endpoint  
curl http://localhost/soen287_project_2/api/resources

# Both should return JSON, not "Route not found"
```

---

## The New Fix Explained

**Old version:** Only stripped `/soen287_project_2`
```php
$path = preg_replace('#^/soen287_project_2#', '', $path);
```

**New version:** Strips ANYTHING before `/api`
```php
if (strpos($path, '/api') !== false) {
    $path = substr($path, strpos($path, '/api'));
}
```

This works if your project is in:
- `/soen287_project_2/api/health` → `/api/health` ✅
- `/my_project/api/health` → `/api/health` ✅
- `/api/health` → `/api/health` ✅

---

## Summary

1. ✅ The fix IS in your project files at `/Users/michaelkauzman/WebstormProjects/soen287_project_2/`
2. ❌ The fix is NOT in your deployed files (wherever Apache is serving from)
3. 🔧 Run `sudo ./auto_fix.sh` to automatically apply the fix
4. 🔄 Restart Apache
5. 🧪 Test!

---

**Run the auto_fix.sh script - it will find and fix everything automatically!** 🚀

