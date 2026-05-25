-- =====================================================
-- COMPLETE DATABASE SETUP WITH ACTUAL DATA
-- SOEN287 Project - MySQL Migration
-- This file creates the database schema AND imports all actual data
-- =====================================================

-- Drop and create database
DROP DATABASE IF EXISTS soen287_project;
CREATE DATABASE soen287_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soen287_project;

-- =====================================================
-- SCHEMA CREATION
-- =====================================================

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pending users table
CREATE TABLE pending_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pending_users_email (email),
    INDEX idx_pending_users_token (verification_token),
    INDEX idx_pending_users_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_tokens_token (token),
    INDEX idx_reset_tokens_user (user_id),
    INDEX idx_reset_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resources table
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ResName VARCHAR(500) NOT NULL,
    ResCategory VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resources_category (ResCategory)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    booked_by_user_id INT NULL,
    booking_purpose TEXT NULL,
    booking_contact VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bookings_resource (resource_id),
    INDEX idx_bookings_date (booking_date),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_user (booked_by_user_id),
    UNIQUE INDEX idx_bookings_unique_slot (resource_id, booking_date, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App settings table
CREATE TABLE app_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking requests table
CREATE TABLE booking_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    requested_by_user_id INT NOT NULL,
    booking_purpose TEXT NULL,
    booking_contact VARCHAR(255) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at DATETIME NULL,
    rejected_at DATETIME NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking_requests_status (status),
    INDEX idx_booking_requests_user (requested_by_user_id),
    INDEX idx_booking_requests_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATA IMPORT - ALL ACTUAL DATA FROM D1
-- =====================================================

-- Disable auto-increment temporarily to preserve IDs
SET FOREIGN_KEY_CHECKS = 0;

-- Import Users (9 users)
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

-- Import Resources (20 resources)
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

-- Import App Settings
INSERT INTO app_settings (setting_key, setting_value, updated_at) VALUES
('booking_approval_mode', 'disabled', NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT '=============================================' AS '';
SELECT 'DATABASE SETUP COMPLETE' AS '';
SELECT '=============================================' AS '';
SELECT '' AS '';

SELECT 'Users imported:' AS Status, COUNT(*) AS Count FROM users;
SELECT 'Resources imported:' AS Status, COUNT(*) AS Count FROM resources;
SELECT 'Admin users:' AS Status, COUNT(*) AS Count FROM users WHERE role = 'admin';
SELECT 'Student users:' AS Status, COUNT(*) AS Count FROM users WHERE role = 'student';
SELECT '' AS '';

SELECT '=============================================' AS '';
SELECT 'ADMIN USERS (Can access admin features)' AS '';
SELECT '=============================================' AS '';
SELECT id, first_name, last_name, email, role FROM users WHERE role IN ('admin', 'staff') ORDER BY id;
SELECT '' AS '';

SELECT '=============================================' AS '';
SELECT 'ALL USERS' AS '';
SELECT '=============================================' AS '';
SELECT id, first_name, last_name, email, role FROM users ORDER BY id;

