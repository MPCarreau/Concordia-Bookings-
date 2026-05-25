-- =====================================================
-- DATA MIGRATION FROM CLOUDFLARE D1 TO MYSQL
-- SOEN287 Project - All Actual Data Export
-- Generated: November 20, 2025
-- =====================================================

USE soen287_project;

-- Disable foreign key checks during import
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (optional - comment out if you want to keep sample data)
-- TRUNCATE TABLE booking_requests;
-- TRUNCATE TABLE bookings;
-- TRUNCATE TABLE password_reset_tokens;
-- TRUNCATE TABLE pending_users;
-- TRUNCATE TABLE resources;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE app_settings;

-- =====================================================
-- USERS TABLE - 9 users total
-- =====================================================

INSERT INTO users (id, first_name, last_name, email, phone_number, password_hash, role, email_verified, email_verified_at, created_at, updated_at) VALUES
(1, 'Admin', 'User', 'michaelkauzman2001@gmail.com', '514-848-2424', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'admin', TRUE, '2025-09-30 18:55:23', '2025-09-30 18:55:23', '2025-10-27 22:42:10'),
(2, 'Staff', 'Member', 'staff@concordia.ca', '514-848-2425', '$2b$10$yT8y3O.KuEVrPqhDKZQqCY3qQjZhKQXoYqoJ5T.6rKUOKLqfWdqE.', 'staff', TRUE, '2025-09-30 18:55:23', '2025-09-30 18:55:23', '2025-09-30 18:55:23'),
(5, 'Michael', 'Kauzman', 'cb2333482@icloud.com', '514-123-4567', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'student', TRUE, '2025-09-30 20:12:34', '2025-09-30 20:12:34', '2025-10-01 16:28:48'),
(6, 'nab', 'kauzman', 'nkauzman@hotmail.com', '5145142323', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'student', TRUE, '2025-09-30 21:20:09', '2025-09-30 21:20:09', '2025-10-25 19:38:11'),
(7, 'Dafan', 'Ho', 'phoenix93127@gmail.com', '9998887777', 'daaad6e5604e8e17bd9f108d91e26afe6281dac8fda0091040a7a6d7bd9b43b5', 'admin', TRUE, '2025-10-12 16:00:32', '2025-10-12 16:00:32', '2025-11-11 21:03:47'),
(8, 'micah', 'carreau', 'micahpcarreau@hotmail.com', '514-777-7777', '236fc9535885122ea6961f2e9fd26d6a44875bc6a3169fcc78378d0dde709b53', 'admin', TRUE, '2025-10-13 20:20:32', '2025-10-13 20:20:32', '2025-10-17 01:18:34'),
(9, 'Nad', 'G', 'nadezhdagagnon@gmail.com', '5147755305', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'admin', TRUE, '2025-10-14 22:19:35', '2025-10-14 22:19:35', '2025-10-25 20:08:33'),
(10, 'test', 'account', 'zeusdoor242@hotmail.com', '55555555555', '0e3246dc869aa660163b186fbf002393d2405f322660341d2c666fd0c8362143', 'student', TRUE, '2025-10-22 20:16:17', '2025-10-22 20:16:17', '2025-10-22 20:16:17'),
(21, 'Daf', 'Hen', 'h_dafan@live.concordia.ca', '123-123-1234', '8f85f3c1d824a9be4376c6a13bcf6a8296b96dbc1c84d01ff00a5d55004af65f', 'student', TRUE, '2025-10-28 21:32:36', '2025-10-28 21:32:36', '2025-10-28 21:32:36');

-- =====================================================
-- RESOURCES TABLE - 20 resources total
-- =====================================================

INSERT INTO resources (id, ResName, ResCategory, created_at) VALUES
(1, 'Small Study Room A - Capacity: 4 people, Location: Library 2nd floor', 'Study Rooms', '2025-09-30 20:43:04'),
(2, 'Small Study Room B - Capacity: 4 people, Location: Library 2nd floor', 'Study Rooms', '2025-09-30 20:43:04'),
(3, 'Medium Study Room C - Capacity: 8 people, Location: Library 3rd floor', 'Study Rooms', '2025-09-30 20:43:04'),
(4, 'Large Study Room D - Capacity: 12 people, Location: Library 3rd floor', 'Study Rooms', '2025-09-30 20:43:04'),
(5, 'Computer Lab 1 - 20 workstations, Location: EV Building, Room 001', 'Computer Labs', '2025-09-30 20:43:04'),
(6, 'Computer Lab 2 - 30 workstations, Location: EV Building, Room 002', 'Computer Labs', '2025-09-30 20:43:04'),
(7, 'Mac Lab - 15 Mac workstations, Location: EV Building, Room 102', 'Computer Labs', '2025-09-30 20:43:04'),
(8, 'Engineering Lab - 25 specialized workstations, Location: EV Building, Room 201', 'Computer Labs', '2025-09-30 20:43:04'),
(9, 'Conference Room A - Capacity: 20 people, Projector, Whiteboard', 'Meeting Rooms', '2025-09-30 20:43:04'),
(10, 'Conference Room B - Capacity: 15 people, Video conferencing equipment', 'Meeting Rooms', '2025-09-30 20:43:04'),
(11, 'Seminar Room - Capacity: 30 people, Presentation equipment', 'Meeting Rooms', '2025-09-30 20:43:04'),
(12, 'Board Room - Capacity: 12 people, Executive meeting space', 'Meeting Rooms', '2025-09-30 20:43:04'),
(13, 'Laptops - Available for short-term loan', 'Equipment', '2025-09-30 20:43:04'),
(14, 'Projectors - Portable presentation equipment', 'Equipment', '2025-09-30 20:43:04'),
(15, 'Cameras - Digital cameras for student projects', 'Equipment', '2025-09-30 20:43:04'),
(16, 'Audio Equipment - Microphones, speakers, recording equipment', 'Equipment', '2025-09-30 20:43:04'),
(17, '3D Printing Lab - Location: EV Building, Room 301', 'Specialized Facilities', '2025-09-30 20:43:04'),
(18, 'Electronics Workshop - Location: EV Building, Room 302', 'Specialized Facilities', '2025-09-30 20:43:04'),
(19, 'Maker Space - General workshop area, Location: EV Building, Room 303', 'Specialized Facilities', '2025-09-30 20:43:04'),
(20, 'Photography Studio - Professional lighting and equipment', 'Specialized Facilities', '2025-09-30 20:43:04');

-- =====================================================
-- APP SETTINGS TABLE
-- =====================================================

INSERT INTO app_settings (setting_key, setting_value, updated_at) VALUES
('booking_approval_mode', 'disabled', NOW());

-- =====================================================
-- NOTES:
-- =====================================================
--
-- 1. Bookings table: Your D1 database has many bookings.
--    These are dynamically created booking slots. You may want to:
--    - Skip importing them and let the system create new ones as needed
--    - Or export them if you need to preserve booking history
--
-- 2. Pending users: These are temporary registrations waiting for email verification.
--    They typically expire after 24 hours, so you may not need to import them.
--
-- 3. Password reset tokens: These are temporary and expire after 1 hour.
--    No need to import them.
--
-- 4. Booking requests: These are pending approval requests.
--    Only import if you have active pending requests you want to keep.
--
-- =====================================================

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the data
SELECT 'Users imported:' AS status, COUNT(*) AS count FROM users;
SELECT 'Resources imported:' AS status, COUNT(*) AS count FROM resources;
SELECT 'Admin users:' AS status, COUNT(*) AS count FROM users WHERE role = 'admin';

-- Show admin users
SELECT id, first_name, last_name, email, role FROM users WHERE role IN ('admin', 'staff');

