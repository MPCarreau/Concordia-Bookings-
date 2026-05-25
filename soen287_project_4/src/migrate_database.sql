-- Migration script to update existing database schema
-- Run this to add email verification and role support to existing database

-- Step 1: Backup existing data (if any)
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Step 2: Add new columns to existing users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin', 'staff'));
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL;

-- Step 3: Add unique constraint to phone_number if not exists
-- Note: SQLite doesn't support adding UNIQUE constraints to existing columns directly
-- You may need to recreate the table if phone_number uniqueness is critical

-- Step 4: Create new tables for email verification workflow
CREATE TABLE IF NOT EXISTS pending_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    verification_token TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin', 'staff')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT (datetime('now', '+24 hours'))
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 5: Create indexes for new columns and tables
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_phone ON pending_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_pending_users_token ON pending_users(verification_token);
CREATE INDEX IF NOT EXISTS idx_pending_users_expires ON pending_users(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Step 6: Update existing users to be email verified (since they were created before verification system)
UPDATE users SET 
    email_verified = TRUE,
    email_verified_at = CURRENT_TIMESTAMP,
    role = 'student'
WHERE email_verified IS NULL OR email_verified = FALSE;

-- Step 7: Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at;
CREATE TRIGGER trigger_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Step 8: Insert sample admin and staff users (if they don't exist)
INSERT OR IGNORE INTO users (
    first_name, 
    last_name, 
    email, 
    phone_number, 
    password_hash, 
    role, 
    email_verified, 
    email_verified_at
) VALUES (
    'Admin',
    'User',
    'admin@concordia.ca',
    '514-848-2424',
    '$2b$10$rKUOKLqfWdqE.yT8y3O.KuEVrPqhDKZQqCY3qQjZhKQXoYqoJ5T.6', -- admin123
    'admin',
    TRUE,
    CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (
    first_name, 
    last_name, 
    email, 
    phone_number, 
    password_hash, 
    role, 
    email_verified, 
    email_verified_at
) VALUES (
    'Staff',
    'Member',
    'staff@concordia.ca',
    '514-848-2425',
    '$2b$10$yT8y3O.KuEVrPqhDKZQqCY3qQjZhKQXoYqoJ5T.6rKUOKLqfWdqE.', -- staff123
    'staff',
    TRUE,
    CURRENT_TIMESTAMP
);

-- Verification: Check the updated schema
.schema users
.schema pending_users
.schema password_reset_tokens

-- Show sample data
SELECT 'Current users:' as info;
SELECT id, first_name, last_name, email, role, email_verified FROM users LIMIT 5;

SELECT 'Pending users:' as info;
SELECT COUNT(*) as pending_count FROM pending_users;