/**
 * Express.js Server API for SOEN287 Project
 * Replaces PHP server with Node.js/Express implementation
 * Uses MySQL database via XAMPP
 */

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendPasswordResetEmail, sendEmailVerification, sendBookingApprovedEmail, sendBookingRejectedEmail } from './src/email-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to strip folder prefix if running behind Apache/XAMPP
app.use((req, res, next) => {
  if (req.url.startsWith('/soen287_project_2')) {
    req.url = req.url.replace('/soen287_project_2', '');
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS, images)

// MySQL connection pool - Railway and local support
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'soen287_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper functions
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^[\+]?[1-9][\d]{0,15}$/.test(cleaned);
}


// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword, role } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword || !role) {S
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (!isValidPhone(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists',
        showLoginLink: true
      });
    }

    const [pendingUsers] = await pool.execute(
      'SELECT id, expires_at FROM pending_users WHERE email = ?',
      [email]
    );

    if (pendingUsers.length > 0) {
      const pending = pendingUsers[0];
      if (new Date(pending.expires_at) > new Date()) {
        return res.status(409).json({
          success: false,
          error: 'Verification email already sent. Please check your email.'
        });
      } else {
        await pool.execute('DELETE FROM pending_users WHERE id = ?', [pending.id]);
      }
    }

    const [phoneUsers] = await pool.execute(
      'SELECT email FROM users WHERE phone_number = ? UNION SELECT email FROM pending_users WHERE phone_number = ?',
      [phoneNumber, phoneNumber]
    );

    if (phoneUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'This phone number is already associated with another account'
      });
    }

    const passwordHash = hashPassword(password);
    const verificationToken = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.execute(
      `INSERT INTO pending_users (first_name, last_name, email, phone_number, password_hash, verification_token, expires_at, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phoneNumber, passwordHash, verificationToken, expiresAt, role]
    );

    const emailSent = await sendEmailVerification(email, firstName, verificationToken, process.env);

    if (emailSent && emailSent.success) {
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for verification instructions.',
        requiresVerification: true
      });
    } else {
      await pool.execute('DELETE FROM pending_users WHERE email = ?', [email]);
      res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Email Verification
app.post('/api/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ success: false, error: 'Token and email are required' });
    }

    await pool.execute("DELETE FROM pending_users WHERE expires_at < NOW()");

    const [pendingUsers] = await pool.execute(
      "SELECT * FROM pending_users WHERE email = ? AND verification_token = ? AND expires_at > NOW()",
      [email, token]
    );

    if (pendingUsers.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification link' });
    }

    const pendingUser = pendingUsers[0];

    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already verified' });
    }

    await pool.execute(
      `INSERT INTO users (first_name, last_name, email, phone_number, password_hash, email_verified, role)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [pendingUser.first_name, pendingUser.last_name, pendingUser.email, pendingUser.phone_number, pendingUser.password_hash, pendingUser.role]
    );

    await pool.execute("DELETE FROM pending_users WHERE id = ?", [pendingUser.id]);

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const [users] = await pool.execute(
      "SELECT id, first_name, last_name, email, phone_number, password_hash, role, email_verified FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = users[0];
    const passwordHash = hashPassword(password);

    if (passwordHash !== user.password_hash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isAdmin = user.role === 'admin';

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const [users] = await pool.execute(
      "SELECT id, first_name, last_name, email, phone_number, password_hash, role FROM users WHERE email = ? AND role = 'admin'",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or not an admin' });
    }

    const user = users[0];
    const passwordHash = hashPassword(password);

    if (passwordHash !== user.password_hash) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get User Role
app.get('/api/user/role', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    const [users] = await pool.execute("SELECT role FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const role = users[0].role;
    const isAdmin = role === 'admin';

    res.json({ success: true, role, isAdmin });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user role' });
  }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const [users] = await pool.execute(
      "SELECT id, first_name, email FROM users WHERE email = ? AND email_verified = TRUE",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'No verified account found with this email' });
    }

    const user = users[0];
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW(), used_at = NULL`,
      [user.id, token, expiresAt]
    );

    console.log('=== SERVER: Calling sendPasswordResetEmail ===');
    console.log('Email:', email);
    console.log('First name:', user.first_name);
    console.log('Token:', token);
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 'undefined');

    const emailSent = await sendPasswordResetEmail(email, user.first_name, token, process.env);

    console.log('=== SERVER: Email service response ===');
    console.log('Response:', JSON.stringify(emailSent, null, 2));

    if (emailSent && emailSent.success) {
      console.log('Email sent successfully');
      res.json({ success: true, message: 'Password reset instructions sent to your email' });
    } else {
      console.error('Email failed to send:', emailSent);
      res.status(500).json({ success: false, error: 'Failed to send reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    await pool.execute("DELETE FROM password_reset_tokens WHERE expires_at < NOW()");

    const [tokens] = await pool.execute(
      "SELECT id, user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used_at IS NULL",
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset link' });
    }

    const resetToken = tokens[0];
    const passwordHash = hashPassword(password);

    await pool.execute(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [passwordHash, resetToken.user_id]
    );

    await pool.execute(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
      [resetToken.id]
    );

    res.json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Update Profile
app.put('/api/update-profile', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (!isValidPhone(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await pool.execute(
      "UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, updated_at = NOW() WHERE email = ?",
      [firstName, lastName, phoneNumber, email]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { firstName, lastName, email, phoneNumber }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get All Resources
app.get('/api/resources', async (req, res) => {
  try {
    const [resources] = await pool.execute("SELECT * FROM resources ORDER BY ResCategory, ResName");
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch resources' });
  }
});

// Create Resource
app.post('/api/resources', async (req, res) => {
  console.log('POST /api/resources called - v2'); // Debug marker
  try {
    const { ResCategory, ResName } = req.body;
    if (!ResCategory || !ResName) {
      return res.status(400).json({ success: false, error: 'ResCategory and ResName are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO resources (ResCategory, ResName, created_at) VALUES (?, ?, NOW())`,
      [ResCategory, ResName]
    );

    // result.insertId works for MySQL; for SQLite/others it may differ. Return affected row id when available.
    const insertId = result && (result.insertId || result.insert_rowid || result.lastID) ? (result.insertId || result.insert_rowid || result.lastID) : null;

    res.status(201).json({ success: true, id: insertId, message: 'Resource created' });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ success: false, error: 'Failed to create resource' });
  }
});

// Update Resource
app.put('/api/resources/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { ResCategory, ResName } = req.body;
    if (!id || !ResCategory || !ResName) {
      return res.status(400).json({ success: false, error: 'id, ResCategory and ResName are required' });
    }

    const [existing] = await pool.execute('SELECT id FROM resources WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    await pool.execute(
      'UPDATE resources SET ResCategory = ?, ResName = ? WHERE id = ?',
      [ResCategory, ResName, id]
    );

    res.json({ success: true, message: 'Resource updated' });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ success: false, error: 'Failed to update resource' });
  }
});

// Delete Resource
app.delete('/api/resources/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'id is required' });
    }

    const [existing] = await pool.execute('SELECT id FROM resources WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    await pool.execute('DELETE FROM resources WHERE id = ?', [id]);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete resource' });
  }
});

// Debug: list registered API routes (exclude 404 handler). Remove in production when no longer needed.
app.get('/api/debug/routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach(layer => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).filter(m => layer.route.methods[m]);
        routes.push({ path: layer.route.path, methods });
      }
    });
    res.json({ success: true, routes });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to enumerate routes' });
  }
});

// Get Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const { date, category } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    let query = "SELECT * FROM bookings WHERE booking_date = ?";
    let params = [date];

    if (category && category !== 'all') {
      query += " AND resource_id IN (SELECT id FROM resources WHERE ResCategory = ?)";
      params.push(category);
    }

    const [bookings] = await pool.execute(query, params);
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Make Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { resourceId, date, timeSlot, userId, purpose, contact } = req.body;

    if (!resourceId || !date || !timeSlot || !userId || !purpose || !contact) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Validate that the provided userId exists in the users table to avoid foreign key errors
    try {
      const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
      if (!userRows || userRows.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid userId: user not found' });
      }
    } catch (err) {
      console.error('User existence check error:', err && err.stack ? err.stack : err);
      return res.status(500).json({ success: false, error: 'Failed to validate user' });
    }

    const [[setting]] = await pool.execute(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'booking_approval_mode'"
    );
    const approvalEnabled = setting && ['enabled', 'true', '1'].includes(setting.setting_value.toLowerCase());

    const [[existingSlot]] = await pool.execute(
      "SELECT id, status FROM bookings WHERE resource_id = ? AND booking_date = ? AND time_slot = ?",
      [resourceId, date, timeSlot]
    );

    if (existingSlot && existingSlot.status === 'booked') {
      return res.status(409).json({ success: false, error: 'Time slot already booked' });
    }

    if (existingSlot && existingSlot.status === 'maintenance') {
      return res.status(400).json({ success: false, error: 'Time slot is under maintenance' });
    }

    if (approvalEnabled) {
      const [[existingRequest]] = await pool.execute(
        "SELECT id FROM booking_requests WHERE resource_id = ? AND booking_date = ? AND time_slot = ? AND requested_by_user_id = ? AND status = 'pending'",
        [resourceId, date, timeSlot, userId]
      );

      if (existingRequest) {
        return res.json({ success: true, message: 'Booking request already submitted and pending approval' });
      }

      await pool.execute(
        `INSERT INTO booking_requests (resource_id, booking_date, time_slot, requested_by_user_id, booking_purpose, booking_contact, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [resourceId, date, timeSlot, userId, purpose, contact]
      );

      return res.status(201).json({
        success: true,
        message: 'Booking request submitted and pending administrator approval'
      });
    }

    if (existingSlot && existingSlot.status === 'available') {
      await pool.execute(
        "UPDATE bookings SET status = 'booked', booked_by_user_id = ?, booking_purpose = ?, booking_contact = ?, updated_at = NOW() WHERE id = ?",
        [userId, purpose, contact, existingSlot.id]
      );
    } else {
      await pool.execute(
        `INSERT INTO bookings (resource_id, booking_date, time_slot, status, booked_by_user_id, booking_purpose, booking_contact)
         VALUES (?, ?, ?, 'booked', ?, ?, ?)`,
        [resourceId, date, timeSlot, userId, purpose, contact]
      );
    }

    res.status(201).json({ success: true, message: 'Booking successful!' });
  } catch (error) {
    console.error('Make booking error:', error && error.stack ? error.stack : error);
    const message = (error && error.message) ? error.message : 'Failed to create booking';
    res.status(500).json({ success: false, error: message });
  }
});

// Get User Bookings
app.get('/api/user-bookings', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const [bookings] = await pool.execute(
      `SELECT b.*, r.ResName as resource_name, r.ResCategory as resource_category
       FROM bookings b
       JOIN resources r ON b.resource_id = r.id
       WHERE b.booked_by_user_id = ? AND b.status = 'booked'
       ORDER BY b.booking_date DESC, b.time_slot DESC`,
      [userId]
    );

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Cancel Booking
app.post('/api/cancel-booking', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'bookingId is required' });
    }

    const [[booking]] = await pool.execute(
      "SELECT id, status FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status !== 'booked') {
      return res.status(400).json({ success: false, error: `Booking is already ${booking.status}` });
    }

    await pool.execute(
      "UPDATE bookings SET status = 'available', booked_by_user_id = NULL, booking_purpose = NULL, booking_contact = NULL, updated_at = NOW() WHERE id = ?",
      [bookingId]
    );

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

// Update Booking
app.post('/api/update-booking', async (req, res) => {
  try {
    const { bookingId, purpose, contact } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'bookingId is required' });
    }

    if (!purpose || !contact) {
      return res.status(400).json({ success: false, error: 'Purpose and contact are required' });
    }

    const [[booking]] = await pool.execute(
      "SELECT id, status FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status !== 'booked') {
      return res.status(400).json({ success: false, error: 'Only booked slots can be updated' });
    }

    await pool.execute(
      "UPDATE bookings SET booking_purpose = ?, booking_contact = ?, updated_at = NOW() WHERE id = ?",
      [purpose, contact, bookingId]
    );

    res.json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// Toggle Maintenance
app.post('/api/toggle-maintenance', async (req, res) => {
  try {
    const { resourceId, date, timeSlot, action } = req.body;

    if (!resourceId || !date || !timeSlot || !action) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (!['block', 'unblock'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be "block" or "unblock"' });
    }

    const [[existingBooking]] = await pool.execute(
      "SELECT id, status FROM bookings WHERE resource_id = ? AND booking_date = ? AND time_slot = ?",
      [resourceId, date, timeSlot]
    );

    if (action === 'block') {
      if (existingBooking) {
        if (existingBooking.status === 'booked') {
          return res.status(400).json({ success: false, error: 'Cannot block a booked time slot' });
        }
        await pool.execute(
          "UPDATE bookings SET status = 'maintenance', updated_at = NOW() WHERE id = ?",
          [existingBooking.id]
        );
      } else {
        await pool.execute(
          `INSERT INTO bookings (resource_id, booking_date, time_slot, status)
           VALUES (?, ?, ?, 'maintenance')`,
          [resourceId, date, timeSlot]
        );
      }
      res.json({ success: true, message: 'Time slot blocked for maintenance' });
    } else {
      if (!existingBooking || existingBooking.status !== 'maintenance') {
        return res.status(400).json({ success: false, error: 'This time slot is not under maintenance' });
      }
      await pool.execute(
        "UPDATE bookings SET status = 'available', updated_at = NOW() WHERE id = ?",
        [existingBooking.id]
      );
      res.json({ success: true, message: 'Maintenance block removed' });
    }
  } catch (error) {
    console.error('Toggle maintenance error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle maintenance' });
  }
});

// Get Booking Approval Mode
app.get('/api/booking-approval-mode', async (req, res) => {
  try {
    const [[setting]] = await pool.execute(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'booking_approval_mode'"
    );
    const enabled = setting && ['enabled', 'true', '1'].includes(setting.setting_value.toLowerCase());
    res.json({ success: true, enabled });
  } catch (error) {
    console.error('Get approval mode error:', error);
    res.status(500).json({ success: false, error: 'Failed to get approval mode' });
  }
});

// Set Booking Approval Mode
app.post('/api/booking-approval-mode', async (req, res) => {
  try {
    const { enabled } = req.body;
    const value = enabled ? 'enabled' : 'disabled';

    await pool.execute(
      `INSERT INTO app_settings (setting_key, setting_value)
       VALUES ('booking_approval_mode', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
      [value]
    );

    res.json({ success: true, enabled: !!enabled });
  } catch (error) {
    console.error('Set approval mode error:', error);
    res.status(500).json({ success: false, error: 'Failed to set approval mode' });
  }
});

// Get Pending Booking Requests (Admin)
app.get('/api/pending-booking-requests', async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT br.id, br.resource_id, br.booking_date, br.time_slot, br.booking_purpose, br.booking_contact,
             br.requested_by_user_id, br.status, br.created_at,
             r.ResName as resource_name, r.ResCategory as category,
             u.first_name, u.last_name, u.email
      FROM booking_requests br
      JOIN resources r ON r.id = br.resource_id
      JOIN users u ON u.id = br.requested_by_user_id
      WHERE br.status = 'pending'
      ORDER BY br.booking_date ASC, br.time_slot ASC
    `);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
});

// (debug endpoint removed)

// Get User Pending Booking Requests
app.get('/api/user-pending-booking-requests', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const [requests] = await pool.execute(`
      SELECT br.id, br.resource_id, br.booking_date, br.time_slot, br.booking_purpose, br.booking_contact,
             br.requested_by_user_id, br.status, br.created_at,
             r.ResName as resource_name, r.ResCategory as category
      FROM booking_requests br
      JOIN resources r ON r.id = br.resource_id
      WHERE br.status = 'pending' AND br.requested_by_user_id = ?
      ORDER BY br.booking_date ASC, br.time_slot ASC
    `, [userId]);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get user pending requests error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
});

// Approve Booking Request
app.post('/api/approve-booking-request', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'id is required' });
    }

    await connection.beginTransaction();

    const [[request]] = await connection.execute(
      "SELECT * FROM booking_requests WHERE id = ?",
      [id]
    );

    if (!request) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: `Cannot approve a ${request.status} request` });
    }

    const [[existing]] = await connection.execute(
      "SELECT id, status FROM bookings WHERE resource_id = ? AND booking_date = ? AND time_slot = ?",
      [request.resource_id, request.booking_date, request.time_slot]
    );

    if (existing && existing.status === 'booked') {
      await connection.rollback();
      return res.status(409).json({ success: false, error: 'Slot already booked' });
    }

    if (existing && existing.status === 'maintenance') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Slot is under maintenance' });
    }

    if (existing && existing.status === 'available') {
      await connection.execute(
        "UPDATE bookings SET status = 'booked', booked_by_user_id = ?, booking_purpose = ?, booking_contact = ?, updated_at = NOW() WHERE id = ?",
        [request.requested_by_user_id, request.booking_purpose, request.booking_contact, existing.id]
      );
    } else {
      await connection.execute(
        `INSERT INTO bookings (resource_id, booking_date, time_slot, status, booked_by_user_id, booking_purpose, booking_contact)
         VALUES (?, ?, ?, 'booked', ?, ?, ?)`,
        [request.resource_id, request.booking_date, request.time_slot, request.requested_by_user_id, request.booking_purpose, request.booking_contact]
      );
    }

    await connection.execute(
      "UPDATE booking_requests SET status = 'approved', approved_at = NOW(), updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Fetch user info for email notification BEFORE committing
    const [[userInfo]] = await connection.execute(
      `SELECT u.email, u.first_name, r.ResName as resource_name
       FROM booking_requests br
       JOIN users u ON br.requested_by_user_id = u.id
       JOIN resources r ON br.resource_id = r.id
       WHERE br.id = ?`,
      [id]
    );

    await connection.commit();

    // Send approval email notification (after successful commit)
    if (userInfo) {
      try {
        console.log('📧 Sending booking approval email to:', userInfo.email);
        const emailResult = await sendBookingApprovedEmail(
          userInfo.email,
          userInfo.first_name,
          userInfo.resource_name,
          request.booking_date,
          request.time_slot,
          process.env
        );
        console.log('✅ Approval email result:', emailResult);
      } catch (emailError) {
        console.error('⚠️ Failed to send approval email (booking still approved):', emailError);
      }
    }

    res.json({ success: true, message: 'Booking request approved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Approve request error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve request' });
  } finally {
    connection.release();
  }
});

// Reject Booking Request
app.post('/api/reject-booking-request', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'id is required' });
    }

    const [[request]] = await pool.execute(
      `SELECT br.*, u.email, u.first_name, r.ResName as resource_name
       FROM booking_requests br
       JOIN users u ON br.requested_by_user_id = u.id
       JOIN resources r ON br.resource_id = r.id
       WHERE br.id = ?`,
      [id]
    );

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Cannot reject a ${request.status} request` });
    }

    await pool.execute(
      "UPDATE booking_requests SET status = 'rejected', rejected_at = NOW(), updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Send rejection email notification
    try {
      console.log('📧 Sending booking rejection email to:', request.email);
      const emailResult = await sendBookingRejectedEmail(
        request.email,
        request.first_name,
        request.resource_name,
        request.booking_date,
        request.time_slot,
        process.env
      );
      console.log('✅ Rejection email result:', emailResult);
    } catch (emailError) {
      console.error('⚠️ Failed to send rejection email (booking still rejected):', emailError);
    }

    res.json({ success: true, message: 'Booking request rejected' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject request' });
  }
});
// Get Daily Schedule
app.get('/api/daily-schedule', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, error: 'Date required' });

    // 1. Determine Working Hours (Exception takes priority over Default)
    let start = "09:00";
    let end = "17:00";

    const [exceptions] = await pool.execute(
      "SELECT start_time, end_time FROM schedule_exceptions WHERE exception_date = ?", 
      [date]
    );

    if (exceptions.length > 0) {
      start = exceptions[0].start_time;
      end = exceptions[0].end_time;
    } else {
      const [[setting]] = await pool.execute("SELECT setting_value FROM app_settings WHERE setting_key = 'working_hours'");
      if (setting) {
        const defaults = JSON.parse(setting.setting_value);
        start = defaults.start;
        end = defaults.end;
      }
    }

    // 2. Get Blackout Ranges for this date
    const [blackouts] = await pool.execute(
      "SELECT start_time, end_time, reason FROM blackout_dates WHERE blackout_date = ?", 
      [date]
    );

    res.json({ success: true, schedule: { start, end, blackouts } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Working Hours
app.get('/api/working-hours', async (req, res) => {
  try {
    const [[row]] = await pool.execute("SELECT setting_value FROM app_settings WHERE setting_key = 'working_hours'");
    const hours = row ? JSON.parse(row.setting_value) : { start: "09:00", end: "17:00" };
    res.json({ success: true, hours });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save Working Hours
app.post('/api/working-hours', async (req, res) => {
  try {
    const { start, end } = req.body;
    const value = JSON.stringify({ start, end });
    await pool.execute(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES ('working_hours', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
      [value]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Schedule Exceptions
app.get('/api/schedule-exceptions', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM schedule_exceptions ORDER BY exception_date");
    res.json({ success: true, exceptions: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add Schedule Exception
app.post('/api/schedule-exceptions', async (req, res) => {
  try {
    const { date, desc, start, end } = req.body;
    await pool.execute(
      "INSERT INTO schedule_exceptions (exception_date, description, start_time, end_time) VALUES (?, ?, ?, ?)",
      [date, desc, start, end]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Schedule Exception
app.delete('/api/schedule-exceptions/:id', async (req, res) => {
  try {
    await pool.execute("DELETE FROM schedule_exceptions WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Blackout Dates
app.get('/api/blackout-dates', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM blackout_dates ORDER BY blackout_date");
    res.json({ success: true, blackouts: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add Blackout Date
app.post('/api/blackout-dates', async (req, res) => {
  try {
    const { date, reason, start, end } = req.body;
    await pool.execute(
      "INSERT INTO blackout_dates (blackout_date, reason, start_time, end_time) VALUES (?, ?, ?, ?)",
      [date, reason, start, end]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Blackout Date
app.delete('/api/blackout-dates/:id', async (req, res) => {
  try {
    await pool.execute("DELETE FROM blackout_dates WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//account deletion
app.delete('/api/delete-account', async(req,res) => {
  try{
    //retrieve user email sent from page
    const {email} = req.body;

    //data verification
    if (!email){
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    //DELETE USER ACCOUNT, SQL QUERY
    const [result] = await pool.execute(
      'DELETE FROM users WHERE email = ?',
      [email]
    );

    //check if email is found in table
    if (result.affectedRows === 0){
      return res.status(400).json({ success: false, error: 'Email not found.' });
    }

    //if no errors
    return res.json({ success: true, message: 'Account deletion successful.' });


  }
  catch (error){
    console.error('Account deletion failed, error encountered:', error);
    res.status(500).json({ success: false, error: 'Account deletion failed.' });
  }

});

//statistics page , calculate stats
app.get('/api/statistics', async(req,res) =>{
  try{
    //most popular resources
    const [popularResources] = await pool.execute(`
      SELECT
      resource_id,
      COUNT(resource_id) AS value_occurrence
      FROM
        bookings
      GROUP BY 
        resource_id
      ORDER BY 
        value_occurrence DESC
      LIMIT 4;
    `);

    //most popular usage times
    const [popularTimes] = await pool.execute(`
      SELECT
      DAYNAME(booking_date) AS weekday,       
      time_slot,             
      COUNT(*) AS value_occurrence
      FROM
            bookings
      GROUP BY 
            weekday, time_slot
      ORDER BY 
            value_occurrence DESC
      LIMIT 4;
      `);

    //total active bookings
    const [totalBookings] = await pool.execute(`
      SELECT COUNT(*) AS active_bookings
      FROM bookings
      WHERE booking_date < CURDATE()
        OR (booking_date = CURDATE() AND time_slot < CURTIME()); 
      `);

    //average bookings per day
    const [avgBookings] = await pool.execute(`
      SELECT AVG(num_bookings) AS avg_booking_per_day
      FROM(
        SELECT booking_date, COUNT(id) AS num_bookings
        FROM bookings
        GROUP BY booking_date
      )
      AS bookings_counts;
      `);

    //most frequent user type
    const [frequentUsertype] = await pool.execute(`
      SELECT
      u.role,
      COUNT(b.id) AS booking_count
      FROM
            bookings b
      JOIN
            users u ON b.booked_by_user_id = u.id
      GROUP BY
            u.role
      ORDER BY
            booking_count DESC
      LIMIT 1;
      `);

    //most popular weekday
    const [popularDay] = await pool.execute(`
      SELECT
      DAYNAME(booking_date) as weekday,
      COUNT(DAYNAME(booking_date)) AS value_occurrence
      FROM
        bookings
      GROUP BY 
        weekday
      ORDER BY 
        value_occurrence DESC
      LIMIT 1;
      `);

      //send all results
      res.json({
        popularResources,
        popularTimes,
        totalBookings,
        avgBookings,
        frequentUsertype,
        popularDay
      });

  }
  catch (error){
    console.error('Error calculating statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate statistics.' });
  }
});

// Modify Booking
app.post('/api/modify-booking', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { oldBookingId, newResourceId, newDate, newTimeSlot, userId, purpose, contact } = req.body;

    if (!oldBookingId || !newResourceId || !newDate || !newTimeSlot || !userId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await connection.beginTransaction();

    // 1. Check if NEW slot is available
    // Check if the slot record exists
    const [[existingSlot]] = await connection.execute(
      "SELECT id, status FROM bookings WHERE resource_id = ? AND booking_date = ? AND time_slot = ?",
      [newResourceId, newDate, newTimeSlot]
    );

    // If record exists and is not available
    if (existingSlot && existingSlot.status !== 'available') {
      await connection.rollback();
      return res.status(409).json({ success: false, error: 'The new time slot is not available.' });
    }

    // 2. Verify OLD booking belongs to user and is active
    const [[oldBooking]] = await connection.execute(
      "SELECT id, status FROM bookings WHERE id = ? AND booked_by_user_id = ? AND status = 'booked'",
      [oldBookingId, userId]
    );

    if (!oldBooking) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Original booking not found or already cancelled.' });
    }

    // 3. Book the NEW slot
    if (existingSlot) {
      await connection.execute(
        "UPDATE bookings SET status = 'booked', booked_by_user_id = ?, booking_purpose = ?, booking_contact = ?, updated_at = NOW() WHERE id = ?",
        [userId, purpose, contact, existingSlot.id]
      );
    } else {
      await connection.execute(
        "INSERT INTO bookings (resource_id, booking_date, time_slot, status, booked_by_user_id, booking_purpose, booking_contact) VALUES (?, ?, ?, 'booked', ?, ?, ?)",
        [newResourceId, newDate, newTimeSlot, userId, purpose, contact]
      );
    }

    // 4. Cancel the OLD booking
    await connection.execute(
      "UPDATE bookings SET status = 'available', booked_by_user_id = NULL, booking_purpose = NULL, booking_contact = NULL, updated_at = NOW() WHERE id = ?",
      [oldBookingId]
    );

    await connection.commit();
    res.json({ success: true, message: 'Booking modified successfully' });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${PORT}`;

  console.log(`🚀 Express server running on ${baseUrl}`);
  console.log(`📊 API endpoints available at ${baseUrl}/api`);
  console.log(`📁 Static files served from: ${__dirname}`);
  console.log(`🗄️  Database: ${process.env.MYSQLDATABASE || process.env.DB_NAME || 'soen287_project'}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Port: ${PORT}`);
});

