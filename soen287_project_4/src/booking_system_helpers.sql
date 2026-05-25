-- Helper scripts for the booking system

-- 1. Add booking slots for a specific date and resource
-- Example: Add all time slots for Study Room A for tomorrow
/*
INSERT INTO bookings (resource_id, booking_date, time_slot, status)
SELECT 1, date('now', '+1 day'), slot, 'available'
FROM (
    SELECT '09:00' as slot UNION SELECT '09:30' UNION SELECT '10:00' UNION SELECT '10:30' UNION
    SELECT '11:00' UNION SELECT '11:30' UNION SELECT '12:00' UNION SELECT '12:30' UNION
    SELECT '13:00' UNION SELECT '13:30' UNION SELECT '14:00' UNION SELECT '14:30' UNION
    SELECT '15:00' UNION SELECT '15:30' UNION SELECT '16:00' UNION SELECT '16:30' UNION
    SELECT '17:00' UNION SELECT '17:30' UNION SELECT '18:00' UNION SELECT '18:30' UNION
    SELECT '19:00' UNION SELECT '19:30' UNION SELECT '20:00' UNION SELECT '20:30' UNION
    SELECT '21:00' UNION SELECT '21:30' UNION SELECT '22:00'
) time_slots;
*/

-- 2. Make a booking (book a resource for a specific date/time)
-- Example: Book Study Room A for today at 10:00 AM for user ID 5
/*
UPDATE bookings 
SET status = 'booked', 
    booked_by_user_id = 5, 
    booking_purpose = 'Group study session',
    booking_contact = 'student@concordia.ca',
    updated_at = CURRENT_TIMESTAMP
WHERE resource_id = 1 
    AND booking_date = date('now') 
    AND time_slot = '10:00'
    AND status = 'available';
*/

-- 3. Cancel a booking (make it available again)
-- Example: Cancel the booking we just made
/*
UPDATE bookings 
SET status = 'available', 
    booked_by_user_id = NULL, 
    booking_purpose = NULL,
    booking_contact = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE resource_id = 1 
    AND booking_date = date('now') 
    AND time_slot = '10:00';
*/

-- 4. Check availability for a specific resource on a specific date
-- Example: Check availability for Study Room A today
/*
SELECT 
    r.ResName,
    b.booking_date,
    b.time_slot,
    b.status,
    CASE 
        WHEN b.booked_by_user_id IS NOT NULL THEN u.first_name || ' ' || u.last_name
        ELSE NULL 
    END as booked_by
FROM resources r
JOIN bookings b ON r.id = b.resource_id
LEFT JOIN users u ON b.booked_by_user_id = u.id
WHERE r.id = 1 AND b.booking_date = date('now')
ORDER BY b.time_slot;
*/

-- 5. View all bookings for a specific user
-- Example: View all bookings for user ID 5
/*
SELECT 
    r.ResCategory,
    r.ResName,
    b.booking_date,
    b.time_slot,
    b.booking_purpose,
    b.booking_contact
FROM bookings b
JOIN resources r ON b.resource_id = r.id
WHERE b.booked_by_user_id = 5
ORDER BY b.booking_date, b.time_slot;
*/

-- 6. Add booking slots for all resources for a specific date
-- Example: Add all time slots for all resources for tomorrow
/*
INSERT INTO bookings (resource_id, booking_date, time_slot, status)
SELECT r.id, date('now', '+1 day'), slot, 'available'
FROM resources r
CROSS JOIN (
    SELECT '09:00' as slot UNION SELECT '09:30' UNION SELECT '10:00' UNION SELECT '10:30' UNION
    SELECT '11:00' UNION SELECT '11:30' UNION SELECT '12:00' UNION SELECT '12:30' UNION
    SELECT '13:00' UNION SELECT '13:30' UNION SELECT '14:00' UNION SELECT '14:30' UNION
    SELECT '15:00' UNION SELECT '15:30' UNION SELECT '16:00' UNION SELECT '16:30' UNION
    SELECT '17:00' UNION SELECT '17:30' UNION SELECT '18:00' UNION SELECT '18:30' UNION
    SELECT '19:00' UNION SELECT '19:30' UNION SELECT '20:00' UNION SELECT '20:30' UNION
    SELECT '21:00' UNION SELECT '21:30' UNION SELECT '22:00'
) time_slots;
*/