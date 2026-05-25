-- Create resources table for booking system
-- Time slots from 9:00 to 22:00 in 30-minute intervals

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ResCategory TEXT NOT NULL,
    ResName TEXT NOT NULL,
    -- Time slots from 9:00 to 22:00 (30-minute intervals)
    slot_0900 TEXT DEFAULT 'available',
    slot_0930 TEXT DEFAULT 'available',
    slot_1000 TEXT DEFAULT 'available',
    slot_1030 TEXT DEFAULT 'available',
    slot_1100 TEXT DEFAULT 'available',
    slot_1130 TEXT DEFAULT 'available',
    slot_1200 TEXT DEFAULT 'available',
    slot_1230 TEXT DEFAULT 'available',
    slot_1300 TEXT DEFAULT 'available',
    slot_1330 TEXT DEFAULT 'available',
    slot_1400 TEXT DEFAULT 'available',
    slot_1430 TEXT DEFAULT 'available',
    slot_1500 TEXT DEFAULT 'available',
    slot_1530 TEXT DEFAULT 'available',
    slot_1600 TEXT DEFAULT 'available',
    slot_1630 TEXT DEFAULT 'available',
    slot_1700 TEXT DEFAULT 'available',
    slot_1730 TEXT DEFAULT 'available',
    slot_1800 TEXT DEFAULT 'available',
    slot_1830 TEXT DEFAULT 'available',
    slot_1900 TEXT DEFAULT 'available',
    slot_1930 TEXT DEFAULT 'available',
    slot_2000 TEXT DEFAULT 'available',
    slot_2030 TEXT DEFAULT 'available',
    slot_2100 TEXT DEFAULT 'available',
    slot_2130 TEXT DEFAULT 'available',
    slot_2200 TEXT DEFAULT 'available',
    -- Future parameters for expansion
    FutureParam1 TEXT,
    FutureParam2 TEXT,
    FutureParam3 TEXT,
    FutureParam4 TEXT,
    FutureParam5 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Study Rooms
INSERT INTO resources (ResCategory, ResName) VALUES
('Study Rooms', 'Small Study Room A - Capacity: 4 people, Location: Library 2nd floor'),
('Study Rooms', 'Small Study Room B - Capacity: 4 people, Location: Library 2nd floor'),
('Study Rooms', 'Medium Study Room C - Capacity: 8 people, Location: Library 3rd floor'),
('Study Rooms', 'Large Study Room D - Capacity: 12 people, Location: Library 3rd floor');

-- Insert Computer Labs
INSERT INTO resources (ResCategory, ResName) VALUES
('Computer Labs', 'Computer Lab 1 - 20 workstations, Location: EV Building, Room 001'),
('Computer Labs', 'Computer Lab 2 - 30 workstations, Location: EV Building, Room 002'),
('Computer Labs', 'Mac Lab - 15 Mac workstations, Location: EV Building, Room 102'),
('Computer Labs', 'Engineering Lab - 25 specialized workstations, Location: EV Building, Room 201');

-- Insert Meeting Rooms
INSERT INTO resources (ResCategory, ResName) VALUES
('Meeting Rooms', 'Conference Room A - Capacity: 20 people, Projector, Whiteboard'),
('Meeting Rooms', 'Conference Room B - Capacity: 15 people, Video conferencing equipment'),
('Meeting Rooms', 'Seminar Room - Capacity: 30 people, Presentation equipment'),
('Meeting Rooms', 'Board Room - Capacity: 12 people, Executive meeting space');

-- Insert Equipment
INSERT INTO resources (ResCategory, ResName) VALUES
('Equipment', 'Laptops - Available for short-term loan'),
('Equipment', 'Projectors - Portable presentation equipment'),
('Equipment', 'Cameras - Digital cameras for student projects'),
('Equipment', 'Audio Equipment - Microphones, speakers, recording equipment');

-- Insert Specialized Facilities
INSERT INTO resources (ResCategory, ResName) VALUES
('Specialized Facilities', '3D Printing Lab - Location: EV Building, Room 301'),
('Specialized Facilities', 'Electronics Workshop - Location: EV Building, Room 302'),
('Specialized Facilities', 'Maker Space - General workshop area, Location: EV Building, Room 303'),
('Specialized Facilities', 'Photography Studio - Professional lighting and equipment');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(ResCategory);
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(ResName);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_resources_updated_at
    AFTER UPDATE ON resources
    FOR EACH ROW
BEGIN
    UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;