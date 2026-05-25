# 🚀 Express.js Backend Setup Guide

## ✅ Migration Complete: PHP → Express.js

Your backend has been successfully converted from PHP to Express.js!

---

## 📦 What Was Created

### New Files:
1. **`server.js`** - Complete Express.js server with all API endpoints
2. **`package.json`** - Node.js dependencies
3. **`.env`** - Environment configuration
4. **`EXPRESS_SETUP_GUIDE.md`** - This guide

### Updated Files:
- All HTML files now point to `http://localhost:3000/api`

---

## 🎯 Quick Start

### Step 1: Install Node.js
If you don't have Node.js installed:
```bash
# Download from: https://nodejs.org/
# Or use Homebrew:
brew install node
```

Verify installation:
```bash
node --version
npm --version
```

### Step 2: Install Dependencies
```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
npm install
```

This installs:
- `express` - Web framework
- `mysql2` - MySQL driver
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `nodemailer` - Email service
- `nodemon` - Dev auto-reload (optional)

### Step 3: Configure Environment
Edit `.env` file and add your SendGrid API key:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=soen287_project
BASE_URL=http://localhost:3000
SENDGRID_API_KEY=your_actual_sendgrid_key_here
```

### Step 4: Ensure MySQL is Running
Make sure MySQL is running in XAMPP:
- Open XAMPP Control Panel
- Start MySQL
- Verify database `soen287_project` exists in phpMyAdmin

### Step 5: Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
🚀 Express server running on http://localhost:3000
📊 API endpoints available at http://localhost:3000/api
📁 Static files served from: /Users/.../soen287_project_2
🗄️  Database: soen287_project on localhost
```

### Step 6: Test
Open in browser:
- **API Health:** `http://localhost:3000/api/health`
- **Home Page:** `http://localhost:3000/index.html`
- **Login:** `http://localhost:3000/login.html`

---

## 🔄 Architecture Change

### Before (PHP/Apache):
```
Browser → Apache → PHP (server.php) → MySQL
        Port 80/8080
```

### After (Express.js):
```
Browser → Express.js (server.js) → MySQL
        Port 3000
```

---

## ✅ All API Endpoints Converted

Every endpoint from your PHP server is now in Express.js:

### Authentication:
- ✅ POST `/api/register`
- ✅ POST `/api/verify-email`
- ✅ POST `/api/login`
- ✅ POST `/api/admin/login`
- ✅ POST `/api/forgot-password`
- ✅ POST `/api/reset-password`
- ✅ GET `/api/user/role`
- ✅ PUT `/api/update-profile`

### Resources & Bookings:
- ✅ GET `/api/resources`
- ✅ GET `/api/bookings`
- ✅ POST `/api/bookings`
- ✅ GET `/api/user-bookings`
- ✅ POST `/api/cancel-booking`
- ✅ POST `/api/toggle-maintenance`

### Admin Features:
- ✅ GET `/api/booking-approval-mode`
- ✅ POST `/api/booking-approval-mode`
- ✅ GET `/api/pending-booking-requests`
- ✅ GET `/api/user-pending-booking-requests`
- ✅ POST `/api/approve-booking-request`
- ✅ POST `/api/reject-booking-request`

### Utility:
- ✅ GET `/api/health`

---

## 📊 Database

Express.js uses the **same MySQL database** as before:
- Database: `soen287_project`
- All tables: users, resources, bookings, booking_requests, etc.
- All your existing data is preserved!

No migration needed - just point Express to your existing database.

---

## 🔧 Development Workflow

### Start Server:
```bash
npm start
```

### Development Mode (auto-reload):
```bash
npm run dev
```

### Stop Server:
Press `Ctrl+C` in terminal

### View Logs:
Server logs appear in the terminal where you ran `npm start`

---

## 🎨 Frontend Changes

All HTML files have been updated:
- **Old:** `http://localhost/soen287_project_2/api`
- **New:** `http://localhost:3000/api`

No other frontend changes needed!

---

## 🔐 Admin Accounts (Same as Before)

| Email | Password | Role |
|-------|----------|------|
| michaelkauzman2001@gmail.com | admin123 | admin |
| phoenix93127@gmail.com | (their password) | admin |
| micahpcarreau@hotmail.com | (their password) | admin |
| nadezhdagagnon@gmail.com | (their password) | admin |

---

## ✅ Testing Checklist

After starting the server:

- [ ] Health check works: `http://localhost:3000/api/health`
- [ ] Home page loads: `http://localhost:3000/`
- [ ] Login works
- [ ] Register works
- [ ] Bookings work
- [ ] Admin features work

---

## 🚨 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "Port 3000 already in use"
Change PORT in `.env`:
```env
PORT=3001
```
Then update HTML files to use port 3001.

### "Connection refused" to MySQL
1. Check MySQL is running in XAMPP
2. Verify credentials in `.env`
3. Test connection:
```bash
mysql -u root -p
```

### Email not sending
1. Add your SendGrid API key to `.env`
2. Check SendGrid account is active
3. Verify email templates in server.js

---

## 📁 File Structure

```
soen287_project_2/
├── server.js              ← Express.js server (replaces src/server.php)
├── package.json           ← Node.js dependencies
├── .env                   ← Configuration
├── *.html                 ← Frontend (updated to port 3000)
├── images/                ← Static assets
├── static/                ← CSS, JS
└── database/              ← SQL files
```

---

## 🎉 Benefits of Express.js

✅ **Modern JavaScript** - Same language for frontend & backend  
✅ **Better Performance** - Non-blocking I/O  
✅ **Rich Ecosystem** - npm packages  
✅ **Easy Debugging** - Better error messages  
✅ **Hot Reload** - Instant changes with nodemon  
✅ **Cloud Ready** - Deploy anywhere (Heroku, AWS, etc.)  

---

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` with SendGrid key
3. ✅ Start server: `npm start`
4. ✅ Test all features
5. 🎯 Optional: Deploy to cloud (Heroku, Railway, Render)

---

## 💡 Pro Tips

### Use nodemon for development:
```bash
npm run dev
```
Server auto-restarts when you save changes!

### Check server logs:
All console.log() and errors appear in terminal

### Access from other devices:
Use your computer's IP instead of localhost:
```
http://192.168.x.x:3000
```

---

## 📞 Need Help?

Common issues and solutions are in the Troubleshooting section above.

For more help:
1. Check terminal logs for errors
2. Verify `.env` configuration
3. Ensure MySQL is running
4. Test API endpoints with curl or Postman

---

**Your Express.js backend is ready! Run `npm install` then `npm start` to begin! 🎉**

