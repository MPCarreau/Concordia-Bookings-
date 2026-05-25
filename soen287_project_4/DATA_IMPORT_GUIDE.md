# Data Migration - Quick Start Guide

## ✅ What's Been Created

I've exported all your actual data from Cloudflare D1 and created SQL files ready to import into MySQL:

### Files Created:

1. **`database/complete_setup_all_data.sql`** ⭐ **USE THIS ONE FIRST**
   - Complete database setup with schema + users + resources
   - Includes 9 users and 20 resources
   - Ready to run in phpMyAdmin

2. **`database/bookings_data.sql`** ⭐ **USE THIS ONE SECOND**
   - All bookings (129 rows) and booking_requests (18 rows)
   - Run AFTER complete_setup_all_data.sql
   - Contains your actual booking history

3. **`database/complete_setup.sql`**
   - Old version (users + resources only)
   - You can ignore this now

4. **`database/import_actual_data.sql`**
   - Data only (no schema)
   - Alternative if schema already exists

5. **`database/mysql_schema.sql`**
   - Original schema with sample data
   - You can ignore this now

## 🚀 How To Import (Step 2)

### Option A: Using phpMyAdmin (Recommended)

**Step 1: Import Schema + Users + Resources**
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on **"SQL"** tab at the top
3. Copy the **ENTIRE** contents of `database/complete_setup_all_data.sql`
4. Paste into the SQL window
5. Click **"Go"**
6. ✅ You should see verification results

**Step 2: Import Bookings + Booking Requests**
1. Stay in phpMyAdmin on the **"SQL"** tab
2. Copy the **ENTIRE** contents of `database/bookings_data.sql`
3. Paste into the SQL window
4. Click **"Go"**
5. ✅ You should see: "Bookings imported: 129" and "Booking requests imported: 18"

### Option B: Using MySQL Command Line

```bash
cd /Users/michaelkauzman/WebstormProjects/soen287_project_2
mysql -uroot < database/complete_setup_all_data.sql
mysql -uroot < database/bookings_data.sql
```

## 📊 What Gets Imported

### From `complete_setup_all_data.sql`:

### ✅ Users (9 total)

| ID | Name | Email | Role | Password Hash (sample) |
|----|------|-------|------|----------------------|
| 1 | Admin User | michaelkauzman2001@gmail.com | **admin** | 4655d1b9... |
| 2 | Staff Member | staff@concordia.ca | **staff** | $2b$10$y... |
| 5 | Michael Kauzman | cb2333482@icloud.com | student | 4655d1b9... |
| 6 | nab kauzman | nkauzman@hotmail.com | student | 4655d1b9... |
| 7 | Dafan Ho | phoenix93127@gmail.com | **admin** | daaad6e5... |
| 8 | micah carreau | micahpcarreau@hotmail.com | **admin** | 236fc953... |
| 9 | Nad G | nadezhdagagnon@gmail.com | **admin** | 5e884898... |
| 10 | test account | zeusdoor242@hotmail.com | student | 0e3246dc... |
| 21 | Daf Hen | h_dafan@live.concordia.ca | student | 8f85f3c1... |

### ✅ Resources (20 total)

**Study Rooms (4):**
- Small Study Room A & B (4 people each)
- Medium Study Room C (8 people)
- Large Study Room D (12 people)

**Computer Labs (4):**
- Computer Lab 1 (20 workstations)
- Computer Lab 2 (30 workstations)
- Mac Lab (15 workstations)
- Engineering Lab (25 workstations)

**Meeting Rooms (4):**
- Conference Room A (20 people)
- Conference Room B (15 people)
- Seminar Room (30 people)
- Board Room (12 people)

**Equipment (4):**
- Laptops
- Projectors
- Cameras
- Audio Equipment

**Specialized Facilities (4):**
- 3D Printing Lab
- Electronics Workshop
- Maker Space
- Photography Studio

### ✅ App Settings
- Booking approval mode: disabled (can be changed via admin panel)

---

### From `bookings_data.sql`:

### ✅ Bookings (129 total)
All your actual booking slots from the D1 database, including:
- Available slots
- Booked slots (with user info)
- Maintenance slots
- Historical booking data

### ✅ Booking Requests (18 total)
All booking approval requests including:
- Approved requests (10)
- Rejected requests (8)
- Complete request history with timestamps

---

## 🔐 Admin Accounts Ready To Use

You have **4 admin users** ready:

| Email | Role | Notes |
|-------|------|-------|
| michaelkauzman2001@gmail.com | admin | You (ID 1) |
| phoenix93127@gmail.com | admin | Dafan Ho (ID 7) |
| micahpcarreau@hotmail.com | admin | Micah (ID 8) |
| nadezhdagagnon@gmail.com | admin | Nad (ID 9) |
| staff@concordia.ca | staff | Staff account (ID 2) |

## ❓ What About Bookings?

Your D1 database has many booking slots. These are **dynamically created** when users make bookings, so you don't need to import them. The system will create new ones as needed.

If you want to preserve booking history, I can export those too, but they're typically not needed for migration.

## ✅ Verification

After running both SQL files, phpMyAdmin will show you:

**From complete_setup_all_data.sql:**
```
Users imported: 9
Resources imported: 20
Admin users: 4
Student users: 5
```

**From bookings_data.sql:**
```
Bookings imported: 129
Booking requests imported: 18
```

Plus lists of all admin users and all users.

## 🔄 What If You Already Ran mysql_schema.sql?

No problem! The `complete_setup_all_data.sql` file **drops and recreates** the database, so it will:
1. Delete the old database
2. Create fresh database
3. Import all your actual data

Then run `bookings_data.sql` to add the booking history.

You won't have duplicates.

## ⚠️ Important Notes

1. **IDs are preserved** - User IDs from D1 match MySQL (1, 2, 5, 6, 7, 8, 9, 10, 21)
2. **All passwords preserved** - Users can login with their existing passwords
3. **Admin roles preserved** - All 4 admin users still have admin access
4. **No sample data** - Only your actual data is imported

## 🎯 Next Steps After Import

1. ✅ Verify import in phpMyAdmin
2. ➡️ Continue to Step 3: Add SendGrid API Key
3. ➡️ Step 4: Merge server files
4. ➡️ Step 5: Deploy to XAMPP
5. ➡️ Step 6: Update frontend API URLs
6. ➡️ Step 7: Test!

---

**Ready?** Copy `database/complete_setup.sql` into phpMyAdmin and run it! 🚀

