-- Add Admin Users to SOEN287 Project
-- This script updates existing users or creates new admin users

USE soen287_project;

-- Update existing users (by ID) to admin role
-- Replace IDs 7 and 8 with your actual user IDs
UPDATE users SET role = 'admin' WHERE id = 7;
UPDATE users SET role = 'admin' WHERE id = 8;

-- To find user IDs, run:
-- SELECT id, email, first_name, last_name, role FROM users;

-- To update by email instead:
-- UPDATE users SET role = 'admin' WHERE email = 'phoenix93127@gmail.com';
-- UPDATE users SET role = 'admin' WHERE email = 'cb2333482@icloud.com';

-- To create a new admin user (if needed):
-- Note: Password hash below is for "admin123"
/*
INSERT INTO users (first_name, last_name, email, phone_number, password_hash, role, email_verified, email_verified_at)
VALUES
('New', 'Admin', 'newadmin@example.com', '514-999-9999', '4655d1b973875abc3e57bfa0254e547024a80052c1f31cbf0b4971d403a565c9', 'admin', TRUE, NOW());
*/

-- Verify admin users
SELECT id, first_name, last_name, email, role FROM users WHERE role = 'admin' OR role = 'staff';

