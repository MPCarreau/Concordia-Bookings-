-- Updated database schema with email verification and role support
-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pending_users;
DROP TABLE IF EXISTS password_reset_tokens;

-- Create pending_users table for unverified registrations
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

-- Create verified users table with email verification and role support
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin', 'staff')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_phone ON pending_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_pending_users_token ON pending_users(verification_token);
CREATE INDEX IF NOT EXISTS idx_pending_users_expires ON pending_users(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert sample admin user (password: admin123)
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

-- Insert sample staff user (password: staff123)
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