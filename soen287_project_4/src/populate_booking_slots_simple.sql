-- Populate booking slots for the next 7 days (smaller batch to avoid compound SELECT limit)
-- This creates 'available' slots for all resources for the next 7 days

-- First, create a temporary table with time slots
CREATE TEMPORARY TABLE temp_time_slots (slot TEXT);
INSERT INTO temp_time_slots (slot) VALUES
('09:00'), ('09:30'), ('10:00'), ('10:30'),
('11:00'), ('11:30'), ('12:00'), ('12:30'),
('13:00'), ('13:30'), ('14:00'), ('14:30'),
('15:00'), ('15:30'), ('16:00'), ('16:30'),
('17:00'), ('17:30'), ('18:00'), ('18:30'),
('19:00'), ('19:30'), ('20:00'), ('20:30'),
('21:00'), ('21:30'), ('22:00');

-- Create temporary table with dates (next 7 days)
CREATE TEMPORARY TABLE temp_dates (booking_date DATE);
INSERT INTO temp_dates (booking_date) VALUES
(date('now')),
(date('now', '+1 day')),
(date('now', '+2 days')),
(date('now', '+3 days')),
(date('now', '+4 days')),
(date('now', '+5 days')),
(date('now', '+6 days'));

-- Now populate bookings
INSERT INTO bookings (resource_id, booking_date, time_slot, status)
SELECT 
    r.id,
    d.booking_date,
    t.slot,
    'available'
FROM resources r
CROSS JOIN temp_dates d
CROSS JOIN temp_time_slots t;

-- Clean up temporary tables
DROP TABLE temp_time_slots;
DROP TABLE temp_dates;