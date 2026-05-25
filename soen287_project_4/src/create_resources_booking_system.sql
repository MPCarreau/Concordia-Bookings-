-- Drop the existing resources table and create a proper booking system
-- This new structure supports date-specific bookings

-- Drop existing table
DROP TABLE IF EXISTS resources;

-- Create resources table (just resource information)
CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ResCategory TEXT NOT NULL,
    ResName TEXT NOT NULL,
    FutureParam1 TEXT,
    FutureParam2 TEXT,
    FutureParam3 TEXT,
    FutureParam4 TEXT,
    FutureParam5 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table (tracks availability for each resource on specific dates/times)
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- e.g., '09:00', '09:30', '10:00', etc.
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'booked', 'maintenance')),
    booked_by_user_id INTEGER NULL, -- NULL if available, user ID if booked
    booking_purpose TEXT NULL, -- Optional description of booking purpose
    booking_contact TEXT NULL, -- Contact info for the booking
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(resource_id, booking_date, time_slot) -- Prevent double booking
);

-- Insert all the resources (same as before)
INSERT INTO resources (ResCategory, ResName) VALUES
-- Study Rooms
('Study Rooms', 'Small Study Room A - Capacity: 4 people, Location: Library 2nd floor'),
('Study Rooms', 'Small Study Room B - Capacity: 4 people, Location: Library 2nd floor'),
('Study Rooms', 'Medium Study Room C - Capacity: 8 people, Location: Library 3rd floor'),
('Study Rooms', 'Large Study Room D - Capacity: 12 people, Location: Library 3rd floor'),

-- Computer Labs
('Computer Labs', 'Computer Lab 1 - 20 workstations, Location: EV Building, Room 001'),
('Computer Labs', 'Computer Lab 2 - 30 workstations, Location: EV Building, Room 002'),
('Computer Labs', 'Mac Lab - 15 Mac workstations, Location: EV Building, Room 102'),
('Computer Labs', 'Engineering Lab - 25 specialized workstations, Location: EV Building, Room 201'),

-- Meeting Rooms
('Meeting Rooms', 'Conference Room A - Capacity: 20 people, Projector, Whiteboard'),
('Meeting Rooms', 'Conference Room B - Capacity: 15 people, Video conferencing equipment'),
('Meeting Rooms', 'Seminar Room - Capacity: 30 people, Presentation equipment'),
('Meeting Rooms', 'Board Room - Capacity: 12 people, Executive meeting space'),

-- Equipment
('Equipment', 'Laptops - Available for short-term loan'),
('Equipment', 'Projectors - Portable presentation equipment'),
('Equipment', 'Cameras - Digital cameras for student projects'),
('Equipment', 'Audio Equipment - Microphones, speakers, recording equipment'),

-- Specialized Facilities
('Specialized Facilities', '3D Printing Lab - Location: EV Building, Room 301'),
('Specialized Facilities', 'Electronics Workshop - Location: EV Building, Room 302'),
('Specialized Facilities', 'Maker Space - General workshop area, Location: EV Building, Room 303'),
('Specialized Facilities', 'Photography Studio - Professional lighting and equipment');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(ResCategory);
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(ResName);
CREATE INDEX IF NOT EXISTS idx_bookings_resource_date ON bookings(resource_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(booked_by_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create trigger to automatically update updated_at timestamp for resources
CREATE TRIGGER IF NOT EXISTS trigger_resources_updated_at
    AFTER UPDATE ON resources
    FOR EACH ROW
BEGIN
    UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create trigger to automatically update updated_at timestamp for bookings
CREATE TRIGGER IF NOT EXISTS trigger_bookings_updated_at
    AFTER UPDATE ON bookings
    FOR EACH ROW
BEGIN
    UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Example: Pre-populate some sample booking slots for today and next few days
-- This creates 'available' slots for all resources for the next 7 days
-- Time slots from 9:00 to 22:00 in 30-minute intervals

-- Note: You can run this section separately to populate bookings for specific date ranges
/*
INSERT INTO bookings (resource_id, booking_date, time_slot, status)
SELECT 
    r.id,
    date('now', '+' || numbers.n || ' days') as booking_date,
    time_slots.slot,
    'available'
FROM resources r
CROSS JOIN (
    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION 
    SELECT 4 UNION SELECT 5 UNION SELECT 6
) numbers -- Next 7 days
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