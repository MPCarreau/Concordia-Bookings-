-- MySQL Schema for SOEN287 Project Migration from Cloudflare D1
-- To be used with XAMPP/phpMyAdmin

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS soen287_project;
CREATE DATABASE soen287_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soen287_project;

-- Users table - stores verified user accounts
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

-- Pending users table - stores unverified registrations
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

-- Resources table - stores bookable resources (rooms, equipment, etc.)
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ResName VARCHAR(255) NOT NULL,
    ResCategory VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resources_category (ResCategory)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings table - stores all booking slots and their status
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

-- App settings table - stores application configuration
CREATE TABLE app_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking requests table - stores pending approval requests
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

-- Insert default admin users (password for all is "admin123")
INSERT INTO users (first_name, last_name, email, phone_number, password_hash, role, email_verified, email_verified_at) VALUES
('Admin', 'User', 'michaelkauzman2001@gmail.com', '514-848-2424', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'admin', TRUE, NOW()),
('Staff', 'Member', 'staff@concordia.ca', '514-848-2425', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'staff', TRUE, NOW());

-- Insert sample resources
INSERT INTO resources (ResName, ResCategory) VALUES
('Study Room A', 'Study Rooms'),
('Study Room B', 'Study Rooms'),
('Study Room C', 'Study Rooms'),
('Meeting Room 101', 'Meeting Rooms'),
('Meeting Room 102', 'Meeting Rooms'),
('Conference Hall', 'Meeting Rooms'),
('Computer Lab 1', 'Computer Labs'),
('Computer Lab 2', 'Computer Labs'),
('Projector - Epson 1', 'Equipment'),
('Projector - Epson 2', 'Equipment'),
('Laptop - Dell 1', 'Equipment'),
('Laptop - HP 1', 'Equipment'),
('Whiteboard - Large', 'Equipment'),
('Webcam - Logitech', 'Equipment');

-- Insert default app setting for booking approval mode (disabled by default)
INSERT INTO app_settings (setting_key, setting_value) VALUES
('booking_approval_mode', 'disabled');

