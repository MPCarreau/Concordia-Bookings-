/**
 * Cloudflare Worker for SOEN287 Project Registration API
 * Handles user registration and stores data in D1 database
 */

import { sendPasswordResetEmail, sendEmailVerification, sendBookingApprovedEmail, sendBookingRejectedEmail } from './email-service.js';

// Ensure application settings and booking requests tables exist
async function ensureAppTables(env) {
  // app_settings: simple key-value store
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // booking_requests: holds pending/approved/rejected booking requests
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      requested_by_user_id INTEGER NOT NULL,
      booking_purpose TEXT NULL,
      booking_contact TEXT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME NULL,
      rejected_at DATETIME NULL,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
      FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  // Helpful indexes
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_booking_requests_user ON booking_requests(requested_by_user_id)`).run();
  await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_requests_unique_pending ON booking_requests(resource_id, booking_date, time_slot, requested_by_user_id, status) WHERE status = 'pending'`).run();
}

async function getApprovalMode(env) {
  await ensureAppTables(env);
  const row = await env.DB.prepare(`SELECT value FROM app_settings WHERE key = 'booking_approval_mode'`).first();
  if (!row) return false; // default disabled
  return String(row.value).toLowerCase() === 'enabled' || row.value === 'true' || row.value === '1';
}

async function setApprovalMode(env, enabled) {
  await ensureAppTables(env);
  const value = enabled ? 'enabled' : 'disabled';
  await env.DB.prepare(`
    INSERT INTO app_settings (key, value)
    VALUES ('booking_approval_mode', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).bind(value).run();
}

// GET /api/booking-approval-mode
async function handleGetApprovalMode(request, env) {
  try {
    const enabled = await getApprovalMode(env);
    return new Response(JSON.stringify({ success: true, enabled }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get approval mode error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to get approval mode' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/booking-approval-mode { enabled: boolean }
async function handleSetApprovalMode(request, env) {
  try {
    const { enabled } = await request.json();
    await setApprovalMode(env, !!enabled);
    return new Response(JSON.stringify({ success: true, enabled: !!enabled }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Set approval mode error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to set approval mode' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// GET /api/pending-booking-requests
async function handleGetPendingBookingRequests(request, env) {
  try {
    await ensureAppTables(env);
    const rows = await env.DB.prepare(`
      SELECT br.id,
             br.booking_date AS date,
             br.time_slot AS timeSlot,
             br.status,
             r.ResName AS resourceName,
             u.email AS userEmail
      FROM booking_requests br
      JOIN resources r ON r.id = br.resource_id
      JOIN users u ON u.id = br.requested_by_user_id
      WHERE br.status = 'pending'
      ORDER BY br.booking_date ASC, br.time_slot ASC
    `).all();

    return new Response(JSON.stringify({ success: true, requests: rows.results || [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get pending booking requests error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch pending booking requests' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// GET /api/user-pending-booking-requests?userId=...
async function handleGetUserPendingBookingRequests(request, env) {
  try {
    await ensureAppTables(env);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const rows = await env.DB.prepare(`
      SELECT br.id,
             br.booking_date AS date,
             br.time_slot AS timeSlot,
             br.status,
             r.ResName AS resourceName,
             u.email AS userEmail
      FROM booking_requests br
      JOIN resources r ON r.id = br.resource_id
      JOIN users u ON u.id = br.requested_by_user_id
      WHERE br.status = 'pending' AND br.requested_by_user_id = ?
      ORDER BY br.booking_date ASC, br.time_slot ASC
    `).bind(userId).all();

    return new Response(JSON.stringify({ success: true, requests: rows.results || [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get user pending booking requests error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch user pending booking requests' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/approve-booking-request { id }
async function handleApproveBookingRequest(request, env) {
  try {
    await ensureAppTables(env);
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const reqRow = await env.DB.prepare(`
      SELECT * FROM booking_requests WHERE id = ?
    `).bind(id).first();

    if (!reqRow) {
      return new Response(JSON.stringify({ success: false, error: 'Request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (reqRow.status !== 'pending') {
      return new Response(JSON.stringify({ success: false, error: `Cannot approve a ${reqRow.status} request` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check existing booking slot status
    const existing = await env.DB.prepare(`
      SELECT id, status FROM bookings
      WHERE resource_id = ? AND booking_date = ? AND time_slot = ?
    `).bind(reqRow.resource_id, reqRow.booking_date, reqRow.time_slot).first();

    if (existing) {
      if (existing.status === 'booked') {
        return new Response(JSON.stringify({ success: false, error: 'Slot already booked' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (existing.status === 'maintenance') {
        return new Response(JSON.stringify({ success: false, error: 'Slot is under maintenance' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update available slot to booked
      await env.DB.prepare(`
        UPDATE bookings
        SET status = 'booked',
            booked_by_user_id = ?,
            booking_purpose = ?,
            booking_contact = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(reqRow.requested_by_user_id, reqRow.booking_purpose, reqRow.booking_contact, existing.id).run();
    } else {
      // Create new booked slot
      await env.DB.prepare(`
        INSERT INTO bookings (resource_id, booking_date, time_slot, status, booked_by_user_id, booking_purpose, booking_contact)
        VALUES (?, ?, ?, 'booked', ?, ?, ?)
      `).bind(reqRow.resource_id, reqRow.booking_date, reqRow.time_slot, reqRow.requested_by_user_id, reqRow.booking_purpose, reqRow.booking_contact).run();
    }

    // Mark request as approved
    await env.DB.prepare(`
      UPDATE booking_requests
      SET status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run();

    // Send approval email notification
    try {
      // Get user and resource details for email
      const userRow = await env.DB.prepare(`
        SELECT email, first_name FROM users WHERE id = ?
      `).bind(reqRow.requested_by_user_id).first();
      
        const resourceRow = await env.DB.prepare(`
          SELECT ResName FROM resources WHERE id = ?
        `).bind(reqRow.resource_id).first();

        if (userRow && resourceRow) {
          await sendBookingApprovedEmail(
            userRow.email,
            userRow.first_name,
            resourceRow.ResName,
            reqRow.booking_date,
            reqRow.time_slot,
            env
          );
          console.log('Booking approval email sent to:', userRow.email);
        }
    } catch (emailError) {
      // Log email error but don't fail the approval
      console.error('Failed to send approval email:', emailError);
    }

    return new Response(JSON.stringify({ success: true, message: 'Request approved and booking created' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Approve booking request error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to approve booking request', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/reject-booking-request { id }
async function handleRejectBookingRequest(request, env) {
  try {
    await ensureAppTables(env);
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const reqRow = await env.DB.prepare(`
      SELECT br.*, u.email, u.first_name, r.ResName as resource_name
      FROM booking_requests br
      JOIN users u ON br.requested_by_user_id = u.id
      JOIN resources r ON br.resource_id = r.id
      WHERE br.id = ?
    `).bind(id).first();
    
    if (!reqRow) {
      return new Response(JSON.stringify({ success: false, error: 'Request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (reqRow.status !== 'pending') {
      return new Response(JSON.stringify({ success: false, error: `Cannot reject a ${reqRow.status} request` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(`
      UPDATE booking_requests
      SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run();

    // Send rejection email notification
    try {
      await sendBookingRejectedEmail(
        reqRow.email,
        reqRow.first_name,
        reqRow.resource_name,
        reqRow.booking_date,
        reqRow.time_slot,
        env
      );
      console.log('Booking rejection email sent to:', reqRow.email);
    } catch (emailError) {
      // Log email error but don't fail the rejection
      console.error('Failed to send rejection email:', emailError);
    }

    return new Response(JSON.stringify({ success: true, message: 'Request rejected' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Reject booking request error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to reject booking request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle get user role by email
async function handleGetUserRole(request, env) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid email is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await env.DB.prepare(
      'SELECT role FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const role = user.role || null;
    const isAdmin = role === 'admin';

    return new Response(JSON.stringify({
      success: true,
      email,
      role,
      isAdmin
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get user role error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Simple password hashing function (in production, use bcrypt or similar)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate secure random token
function generateResetToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Clean up expired tokens
async function cleanupExpiredTokens(env) {
  const now = new Date().toISOString();
  await env.DB.prepare('DELETE FROM password_reset_tokens WHERE expires_at < ?').bind(now).run();
}

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (basic validation)
function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Handle forgot password request
async function handleForgotPassword(request, env) {
  try {
    console.log('=== FORGOT PASSWORD DEBUG START ===');
    const { email } = await request.json();
    console.log('Email received:', email);

    // Validation
    if (!email) {
      console.log('Error: Email is required');
      return new Response(JSON.stringify({
        success: false,
        error: 'Email is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(email)) {
      console.log('Error: Invalid email format');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Email validation passed');

    // Check if user exists and email is verified
    console.log('Querying database for user...');
    const user = await env.DB.prepare(
      'SELECT id, first_name, email FROM users WHERE email = ? AND email_verified = TRUE'
    ).bind(email).first();

    console.log('User query result:', user);

    if (!user) {
      console.log('Error: User not found or email not verified');
      // For security, don't reveal if email exists or not
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User found, proceeding with token generation');

    // Generate reset token (temporarily skip cleanup to isolate issue)
    console.log('Generating reset token...');
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    console.log('Token generated:', token);
    console.log('Expires at:', expiresAt);

    // Store reset token
    console.log('Storing reset token in database...');
    await env.DB.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).bind(user.id, token, expiresAt).run();

    console.log('Token stored successfully');

    // Send password reset email
    try {
      console.log('Starting email sending process...');
      const resetUrl = `${env.BASE_URL || 'https://soen287-project-2.pages.dev'}/reset-password.html?token=${token}`;
      console.log('Reset URL:', resetUrl);
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: user.email }],
            },
          ],
          from: {
            email: 'michaelkauzman2001@hotmail.com',
            name: 'SOEN 287 Project',
          },
          subject: 'Reset Your Password - SOEN 287 Project',
          content: [
            {
              type: 'text/plain',
              value: `Hello ${user.first_name},\n\nPlease click this link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nBest regards,\nSOEN 287 Project Team`,
            },
            {
              type: 'text/html',
              value: `
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p>Hello ${user.first_name},</p>
                    <p>We received a request to reset your password for your SOEN 287 Project account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${resetUrl}</p>
                    <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <p>Best regards,<br>SOEN 287 Project Team</p>
                </body>
                </html>
              `,
            },
          ],
        }),
      });

      console.log('SendGrid response status:', response.status);
      console.log('SendGrid response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('SendGrid password reset error:', response.status, errorData);
        
        // Remove the token since email failed
        await env.DB.prepare('DELETE FROM password_reset_tokens WHERE token = ?').bind(token).run();
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to send reset email. Please try again later.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Password reset email sent successfully to', email);
      console.log('=== FORGOT PASSWORD DEBUG END ===');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Reset link sent to email'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      console.error('Email error stack:', emailError.stack);
      
      // Remove the token since email failed
      await env.DB.prepare('DELETE FROM password_reset_tokens WHERE token = ?').bind(token).run();
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send reset email. Please try again later.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('=== FORGOT PASSWORD MAIN ERROR ===');
    console.error('Forgot password error:', error);
    console.error('Error stack:', error.stack);
    console.error('=== FORGOT PASSWORD MAIN ERROR END ===');
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle password reset
async function handlePasswordReset(request, env) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // Validation
    if (!token || !password || !confirmPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token, password, and confirm password are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Passwords do not match'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Password must be at least 6 characters long'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean up expired tokens
    await cleanupExpiredTokens(env);

    // Find valid reset token
    const resetToken = await env.DB.prepare(`
      SELECT rt.id, rt.user_id, rt.expires_at, rt.used_at, u.email
      FROM password_reset_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = ? AND rt.expires_at > ? AND rt.used_at IS NULL
    `).bind(token, new Date().toISOString()).first();

    if (!resetToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired reset token'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(passwordHash, resetToken.user_id).run();

    // Mark token as used
    await env.DB.prepare(`
      UPDATE password_reset_tokens 
      SET used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(resetToken.id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Password reset successful'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle email verification
async function handleVerifyEmail(request, env) {
  try {
    const { token, email } = await request.json();

    // Validation
    if (!token || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Verification token and email are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean up expired pending users first
    const now = new Date().toISOString();
    await env.DB.prepare('DELETE FROM pending_users WHERE expires_at < ?').bind(now).run();

    // Find the pending user with valid token
    const pendingUser = await env.DB.prepare(`
      SELECT id, first_name, last_name, email, phone_number, password_hash, verification_token, expires_at
      FROM pending_users 
      WHERE email = ? AND verification_token = ? AND expires_at > ?
    `).bind(email, token, now).first();

    if (!pendingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired verification token'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists in users table (in case of duplicate verification attempts)
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      // Remove from pending users table since user already exists
      await env.DB.prepare('DELETE FROM pending_users WHERE id = ?').bind(pendingUser.id).run();
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Account has already been verified'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Move user from pending_users to users table
    const insertResult = await env.DB.prepare(`
      INSERT INTO users (first_name, last_name, email, phone_number, password_hash, email_verified, email_verified_at)
      VALUES (?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)
    `).bind(
      pendingUser.first_name,
      pendingUser.last_name,
      pendingUser.email,
      pendingUser.phone_number,
      pendingUser.password_hash
    ).run();

    if (!insertResult.success) {
      throw new Error('Failed to create verified user account');
    }

    // Remove user from pending_users table
    await env.DB.prepare('DELETE FROM pending_users WHERE id = ?').bind(pendingUser.id).run();

    // Return success with user info
    return new Response(JSON.stringify({
      success: true,
      message: 'Email verified successfully! Your account is now active.',
      user: {
        firstName: pendingUser.first_name,
        lastName: pendingUser.last_name,
        email: pendingUser.email
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogin(request, env) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find user by email (include role)
    const user = await env.DB.prepare(
      'SELECT id, first_name, last_name, email, phone_number, password_hash, role FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    
    if (passwordHash !== user.password_hash) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';

    // Successful login - return user info (without password hash)
    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        isAdmin: isAdmin
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle admin login
async function handleAdminLogin(request, env) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find admin user by email and check if role is admin or staff
    const user = await env.DB.prepare(
      'SELECT id, first_name, last_name, email, phone_number, password_hash, role FROM users WHERE email = ? AND (role = ? OR role = ?)'
    ).bind(email, 'admin', 'staff').first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid admin credentials'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    
    if (passwordHash !== user.password_hash) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid admin credentials'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Successful admin login - return user info (without password hash)
    return new Response(JSON.stringify({
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
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleRegister(request, env) {
  try {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Passwords do not match'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidPhone(phoneNumber)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid phone number format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Password must be at least 6 characters long'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists in users table (verified accounts)
    const existingUser = await env.DB.prepare(
      'SELECT id, email FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'An account with this email already exists and is verified. Please log in instead.',
        showLoginLink: true
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user already has a pending verification
    const existingPendingUser = await env.DB.prepare(
      'SELECT id, email, phone_number, expires_at FROM pending_users WHERE email = ?'
    ).bind(email).first();

    if (existingPendingUser) {
      // Check if the pending registration has expired
      const now = new Date().toISOString();
      if (existingPendingUser.expires_at > now) {
        // Still valid, user should check their email
        return new Response(JSON.stringify({
          success: false,
          error: 'A verification email has already been sent to this address. Please check your email and follow the verification link. The link will expire in 24 hours.',
          showResendLink: false
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Expired, remove the old pending user
        await env.DB.prepare('DELETE FROM pending_users WHERE id = ?').bind(existingPendingUser.id).run();
      }
    }

    // Check if phone number is already in use (in either table)
    const existingPhone = await env.DB.prepare(
      'SELECT email FROM users WHERE phone_number = ? UNION SELECT email FROM pending_users WHERE phone_number = ?'
    ).bind(phoneNumber, phoneNumber).first();

    if (existingPhone) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This phone number is already associated with another account.'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateResetToken(); // Reuse the token generation function
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    try {
      console.log('About to insert pending user with data:', {
        firstName, lastName, email, phoneNumber, 
        passwordHashLength: passwordHash?.length,
        verificationToken, expiresAt, role: 'student'
      });
      
      const result = await env.DB.prepare(`
        INSERT INTO pending_users (first_name, last_name, email, phone_number, password_hash, verification_token, expires_at, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(firstName, lastName, email, phoneNumber, passwordHash, verificationToken, expiresAt, 'student').run();

      console.log('Database INSERT result:', result);

      if (!result.success) {
        console.error('Failed to insert pending user:', result.error);
        console.error('Result details:', JSON.stringify(result, null, 2));
        return new Response(JSON.stringify({
          success: false,
          error: `Database error: ${result.error || 'Unknown error'}`
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Successfully inserted pending user with ID:', result.meta?.last_row_id);
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return new Response(JSON.stringify({
        success: false,
        error: `Database operation failed: ${dbError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send verification email
    try {
      const baseUrl = env.BASE_URL || 'https://soen287-project-2.pages.dev';
      const verificationUrl = `${baseUrl}/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email }],
            },
          ],
          from: {
            email: 'michaelkauzman2001@hotmail.com',
            name: 'Concordia Student Services',
          },
          subject: 'Verify Your Account - Concordia Student Services',
          content: [
            {
              type: 'text/plain',
              value: `Hello ${firstName},\n\nThank you for registering with Concordia Student Services!\n\nPlease verify your account by clicking this link:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nConcordia Student Services Team`,
            },
            {
              type: 'text/html',
              value: `
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #802f2f;">Verify Your Account</h2>
                    <p>Hello ${firstName},</p>
                    <p>Thank you for registering with Concordia Student Services!</p>
                    <p>Please click the link below to verify your account and complete your registration:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #802f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Account</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
                    <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                    <p>Best regards,<br>Concordia Student Services Team</p>
                </body>
                </html>
              `,
            },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('SendGrid verification email error:', emailResponse.status, errorData);
        
        // Remove the pending user since email failed
        await env.DB.prepare('DELETE FROM pending_users WHERE email = ?').bind(email).run();
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to send verification email. Please try again later.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Verification email sent successfully to', email);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Registration successful! Please check your email for verification instructions.',
        requiresVerification: true
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      
      // Remove the pending user since email failed
      await env.DB.prepare('DELETE FROM pending_users WHERE email = ?').bind(email).run();
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleUpdateProfile(request, env) {
  try {
    const { firstName, lastName, email, phoneNumber } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidPhone(phoneNumber)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid phone number format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user ID from authorization token (you may need to implement token verification)
    // For now, we'll assume the email in the request is the user to update
    // In a real app, you'd extract user ID from a JWT token or session
    
    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (!existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update user profile
    const result = await env.DB.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone_number = ? 
      WHERE email = ?
    `).bind(firstName, lastName, phoneNumber, email).run();

    if (result.success) {
      // Fetch updated user data
      const updatedUser = await env.DB.prepare(
        'SELECT first_name, last_name, email, phone_number FROM users WHERE email = ?'
      ).bind(email).first();

      return new Response(JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Database update failed');
    }

  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle get all resources
async function handleGetResources(request, env) {
  try {
    const resources = await env.DB.prepare('SELECT * FROM resources ORDER BY ResCategory, ResName').all();
    
    return new Response(JSON.stringify({
      success: true,
      resources: resources.results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch resources'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle get bookings for a specific date and category
async function handleGetBookings(request, env) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const category = url.searchParams.get('category');

    if (!date) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Date parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let query;
    let params;

    if (category && category !== 'all') {
      query = `
        SELECT b.resource_id, b.booking_date, b.time_slot, b.status, b.booked_by_user_id as user_id, b.booking_purpose as purpose
        FROM bookings b
        JOIN resources r ON b.resource_id = r.id
        WHERE b.booking_date = ? AND r.ResCategory = ?
      `;
      params = [date, category];
    } else {
      query = `
        SELECT resource_id, booking_date, time_slot, status, booked_by_user_id as user_id, booking_purpose as purpose
        FROM bookings
        WHERE booking_date = ?
      `;
      params = [date];
    }

    const bookings = await env.DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({
      success: true,
      bookings: bookings.results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch bookings'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle creating a new booking
async function handleMakeBooking(request, env) {
  try {
    const { resourceId, date, timeSlot, userId, purpose, contact } = await request.json();

    // Validate required fields
    if (!resourceId || !date || !timeSlot || !userId || !purpose || !contact) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If approval mode is enabled, create a booking request instead of immediate booking
    const approvalEnabled = await getApprovalMode(env);

    // Check if there is an existing slot that is already booked or maintenance
    const existingSlot = await env.DB.prepare(`
      SELECT id, status FROM bookings 
      WHERE resource_id = ? AND booking_date = ? AND time_slot = ?
    `).bind(resourceId, date, timeSlot).first();

    if (existingSlot && existingSlot.status === 'booked') {
      return new Response(JSON.stringify({ success: false, error: 'This time slot is already booked' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (existingSlot && existingSlot.status === 'maintenance') {
      return new Response(JSON.stringify({ success: false, error: 'This time slot is unavailable (maintenance)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (approvalEnabled) {
      await ensureAppTables(env);

      // Prevent duplicate pending requests for same user/slot
      const dup = await env.DB.prepare(`
        SELECT id FROM booking_requests
        WHERE resource_id = ? AND booking_date = ? AND time_slot = ? AND requested_by_user_id = ? AND status = 'pending'
      `).bind(resourceId, date, timeSlot, userId).first();
      if (dup) {
        return new Response(JSON.stringify({ success: true, message: 'Booking request already submitted and pending approval' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const ins = await env.DB.prepare(`
        INSERT INTO booking_requests (resource_id, booking_date, time_slot, requested_by_user_id, booking_purpose, booking_contact, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).bind(resourceId, date, timeSlot, userId, purpose, contact).run();

      if (ins.success) {
        return new Response(JSON.stringify({ success: true, message: 'Booking request submitted and pending administrator approval' }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: false, error: 'Failed to submit booking request' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Immediate booking path (approval disabled)
    // Check if an available slot exists, if not create it and book it
    const availableSlot = existingSlot && existingSlot.status === 'available' ? existingSlot : await env.DB.prepare(`
      SELECT id, status FROM bookings 
      WHERE resource_id = ? AND booking_date = ? AND time_slot = ? AND status = 'available'
    `).bind(resourceId, date, timeSlot).first();

    let result;
    if (availableSlot && availableSlot.status === 'available') {
      result = await env.DB.prepare(`
        UPDATE bookings 
        SET status = 'booked', booked_by_user_id = ?, booking_purpose = ?, booking_contact = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(userId, purpose, contact, availableSlot.id).run();
    } else {
      result = await env.DB.prepare(`
        INSERT INTO bookings (resource_id, booking_date, time_slot, status, booked_by_user_id, booking_purpose, booking_contact)
        VALUES (?, ?, ?, 'booked', ?, ?, ?)
      `).bind(resourceId, date, timeSlot, userId, purpose, contact).run();
    }

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: 'Booking created successfully' }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Failed to create booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create booking'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle getting user's bookings
async function handleGetUserBookings(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's bookings with resource information
    const userBookings = await env.DB.prepare(`
      SELECT 
        b.id,
        b.booking_date,
        b.time_slot,
        b.status,
        b.booking_purpose as purpose,
        b.booking_contact as contact,
        b.created_at,
        r.ResName as resource_name,
        r.ResCategory as resource_category
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      WHERE b.booked_by_user_id = ? AND b.status = 'booked'
      ORDER BY b.booking_date ASC, b.time_slot ASC
    `).bind(userId).all();
    
    return new Response(JSON.stringify({
      success: true,
      bookings: userBookings.results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch user bookings'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle cancelling a booking
async function handleCancelBooking(request, env) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Booking ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Cancel booking request for ID:', bookingId);

    // First check if the booking exists and get its current status
    const existingBooking = await env.DB.prepare(`
      SELECT id, status, booked_by_user_id, resource_id, booking_date, time_slot
      FROM bookings 
      WHERE id = ?
    `).bind(bookingId).first();

    console.log('Existing booking found:', existingBooking);

    if (!existingBooking) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Booking not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (existingBooking.status !== 'booked') {
      return new Response(JSON.stringify({
        success: false,
        error: `Booking is already ${existingBooking.status}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update the booking status to available and clear user data
    const result = await env.DB.prepare(`
      UPDATE bookings 
      SET status = 'available', 
          booked_by_user_id = NULL, 
          booking_purpose = NULL, 
          booking_contact = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'booked'
    `).bind(bookingId).run();

    console.log('Update result:', result);

    // Verify the booking was actually updated by checking its current state
    const updatedBooking = await env.DB.prepare(`
      SELECT id, status, booked_by_user_id
      FROM bookings 
      WHERE id = ?
    `).bind(bookingId).first();

    console.log('Booking after update:', updatedBooking);

    // Check if the booking was successfully cancelled by verifying the status changed
    if (result.success && updatedBooking && updatedBooking.status === 'available' && updatedBooking.booked_by_user_id === null) {
      // Send cancellation email notification
      try {
        // Get user and resource details for email
        const userRow = await env.DB.prepare(`SELECT email, first_name FROM users WHERE id = ?`).bind(existingBooking.booked_by_user_id).first();
        const resourceRow = await env.DB.prepare(`SELECT ResName FROM resources WHERE id = ?`).bind(existingBooking.resource_id).first();
        if (userRow && resourceRow) {
          await sendBookingCancelledEmail(
            userRow.email,
            userRow.first_name,
            resourceRow.ResName,
            existingBooking.booking_date,
            existingBooking.time_slot,
            env
          );
          console.log('Booking cancellation email sent to:', userRow.email);
        }
      } catch (emailError) {
        // Log email error but don't fail the cancellation
        console.error('Failed to send cancellation email:', emailError);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Booking cancelled successfully'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update booking - no changes made',
        debug: {
          updateSuccess: result.success,
          changesCount: result.changes,
          bookingExists: !!existingBooking,
          currentStatus: existingBooking?.status,
          bookingAfterUpdate: updatedBooking
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to cancel booking',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleToggleMaintenance(request, env) {
  try {
    const { resourceId, date, timeSlot, action } = await request.json();

    if (!resourceId || !date || !timeSlot || !action) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Resource ID, date, time slot, and action are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action !== 'block' && action !== 'unblock') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Action must be either "block" or "unblock"'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Toggle maintenance request:', { resourceId, date, timeSlot, action });

    // Check if a booking slot already exists
    const existingBooking = await env.DB.prepare(`
      SELECT id, status
      FROM bookings 
      WHERE resource_id = ? AND booking_date = ? AND time_slot = ?
    `).bind(resourceId, date, timeSlot).first();

    console.log('Existing booking:', existingBooking);

    if (action === 'block') {
      if (existingBooking) {
        if (existingBooking.status === 'booked') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Cannot block a slot that is currently booked. Please cancel the booking first.'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Update existing slot to maintenance
        await env.DB.prepare(`
          UPDATE bookings 
          SET status = 'maintenance',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(existingBooking.id).run();
      } else {
        // Create new maintenance slot
        await env.DB.prepare(`
          INSERT INTO bookings (resource_id, booking_date, time_slot, status, created_at, updated_at)
          VALUES (?, ?, ?, 'maintenance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(resourceId, date, timeSlot).run();
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Slot blocked for maintenance'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else { // action === 'unblock'
      if (!existingBooking) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No booking slot found to unblock'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (existingBooking.status !== 'maintenance') {
        return new Response(JSON.stringify({
          success: false,
          error: `Slot is not in maintenance mode (current status: ${existingBooking.status})`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update slot back to available
      await env.DB.prepare(`
        UPDATE bookings 
        SET status = 'available',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(existingBooking.id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Slot unblocked and made available'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error toggling maintenance:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to toggle maintenance status',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Email notification for booking cancellation
async function sendBookingCancelledEmail(userEmail, firstName, resourceName, bookingDate, timeSlot, env) {
  try {
    console.log('=== BOOKING CANCELLED EMAIL DEBUG ===');
    console.log('Sending booking cancellation email to:', userEmail);
    console.log('Resource:', resourceName, 'Date:', bookingDate, 'Time:', timeSlot);
    if (!env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured in environment variables');
      throw new Error('SENDGRID_API_KEY not configured');
    }
    const baseUrl = env.BASE_URL || 'https://soen287-project-2.pages.dev';
    const bookingsUrl = `${baseUrl}/bookings.html`;
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: userEmail }],
        },
      ],
      from: {
        email: 'michaelkauzman2001@hotmail.com',
        name: 'Concordia Student Services',
      },
      subject: 'Booking Cancelled - Concordia Student Services',
      content: [
        {
          type: 'text/plain',
          value: `Hello ${firstName},\n\nYour booking has been cancelled.\n\nBooking Details:\n- Resource: ${resourceName}\n- Date: ${bookingDate}\n- Time: ${timeSlot}\n\nIf this was a mistake, you can rebook at: ${bookingsUrl}\n\nBest regards,\nConcordia Student Services Team`,
        },
        {
          type: 'text/html',
          value: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #d32f2f; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
                    <h2 style="margin: 0; color: white;">Booking Cancelled</h2>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
                    <p>Hello ${firstName},</p>
                    <p>Your booking has been <strong>cancelled</strong>.</p>
                    <div style="background-color: white; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #d32f2f;">Booking Details</h3>
                        <p style="margin: 8px 0;"><strong>Resource:</strong> ${resourceName}</p>
                        <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
                        <p style="margin: 8px 0;"><strong>Time:</strong> ${timeSlot}</p>
                    </div>
                    <p>If this was a mistake, you can rebook your appointment <a href="${bookingsUrl}" style="color: #d32f2f; font-weight: bold;">here</a>.</p>
                    <p>Best regards,<br>Concordia Student Services Team</p>
                </div>
            </body>
            </html>
          `,
        },
      ],
    };
    console.log('Email payload prepared for booking cancellation');
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
    console.log('SendGrid response status:', response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('SendGrid booking cancellation email error:', response.status, errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }
    console.log('Booking cancellation email sent successfully via SendGrid');
    return { success: true, provider: 'SendGrid' };
  } catch (error) {
    console.error('Booking cancellation email sending failed:', error);
    console.error('Error stack:', error.stack);
    throw new Error('Failed to send booking cancellation email');
  }
}

// Main Worker export
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // Route handling
    if (path === '/api/register' && request.method === 'POST') {
      return handleRegister(request, env);
    }

    if (path === '/api/test-pending-insert' && request.method === 'POST') {
      return handleTestPendingInsert(request, env);
    }

    if (path === '/api/test-sendgrid' && request.method === 'POST') {
      return handleTestSendGrid(request, env);
    }

    if (path === '/api/verify-email' && request.method === 'POST') {
      return handleVerifyEmail(request, env);
    }

    if (path === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    if (path === '/api/admin/login' && request.method === 'POST') {
      return handleAdminLogin(request, env);
    }

    if (path === '/api/forgot-password' && request.method === 'POST') {
      return handleForgotPassword(request, env);
    }

    if (path === '/api/reset-password' && request.method === 'POST') {
      return handlePasswordReset(request, env);
    }

    if (path === '/api/update-profile' && request.method === 'PUT') {
      return handleUpdateProfile(request, env);
    }

        // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Booking approval mode endpoints
    if (path === '/api/booking-approval-mode' && request.method === 'GET') {
      return handleGetApprovalMode(request, env);
    }
    if (path === '/api/booking-approval-mode' && request.method === 'POST') {
      return handleSetApprovalMode(request, env);
    }

    // Booking requests endpoints
    if (path === '/api/pending-booking-requests' && request.method === 'GET') {
      return handleGetPendingBookingRequests(request, env);
    }
    if (path === '/api/user-pending-booking-requests' && request.method === 'GET') {
      return handleGetUserPendingBookingRequests(request, env);
    }
    if (path === '/api/approve-booking-request' && request.method === 'POST') {
      return handleApproveBookingRequest(request, env);
    }
    if (path === '/api/reject-booking-request' && request.method === 'POST') {
      return handleRejectBookingRequest(request, env);
    }

    // Test registration email endpoint for debugging
    if (url.pathname === '/api/test-registration-email') {
      try {
        const testEmail = 'cb2333482@icloud.com';
        const firstName = 'Test';
        const verificationToken = generateResetToken();
        const baseUrl = env.BASE_URL || 'https://soen287-project-2.pages.dev';
        const verificationUrl = `${baseUrl}/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(testEmail)}`;
        
        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: testEmail }],
              },
            ],
            from: {
              email: 'michaelkauzman2001@hotmail.com',
              name: 'Concordia Student Services',
            },
            subject: 'Test Registration Email - Concordia Student Services',
            content: [
              {
                type: 'text/plain',
                value: `Hello ${firstName},\n\nThis is a test registration email.\n\nVerification URL: ${verificationUrl}`,
              },
            ],
          }),
        });

        const responseText = await emailResponse.text();
        
        return new Response(JSON.stringify({
          success: emailResponse.ok,
          status: emailResponse.status,
          response: responseText,
          verificationUrl: verificationUrl,
          sendgridConfigured: !!env.SENDGRID_API_KEY,
          message: emailResponse.ok ? 'Registration email sent successfully' : 'Registration email failed'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          stack: error.stack
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Test email check endpoint for debugging
    if (url.pathname === '/api/test-email-check') {
      try {
        const urlParams = new URLSearchParams(url.search);
        const testEmail = urlParams.get('email') || 'test@example.com';
        
        const userCheck = await env.DB.prepare(
          'SELECT id, email FROM users WHERE email = ?'
        ).bind(testEmail).first();
        
        const pendingCheck = await env.DB.prepare(
          'SELECT id, email, expires_at FROM pending_users WHERE email = ?'
        ).bind(testEmail).first();
        
        return new Response(JSON.stringify({
          success: true,
          email: testEmail,
          inUsers: !!userCheck,
          inPending: !!pendingCheck,
          userDetails: userCheck,
          pendingDetails: pendingCheck,
          currentTime: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Test complete forgot password flow endpoint for debugging
    if (url.pathname === '/api/test-complete-flow') {
      try {
        const testEmail = 'michaelkauzman2001@gmail.com';
        
        // Step 1: User lookup
        const user = await env.DB.prepare(
          'SELECT id, first_name, email, email_verified FROM users WHERE email = ? AND email_verified = TRUE'
        ).bind(testEmail).first();
        
        if (!user) {
          return new Response(JSON.stringify({
            success: false,
            error: 'User not found',
            step: 'user_lookup'
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Step 2: Generate token
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        // Step 3: Insert token
        await env.DB.prepare(`
          INSERT INTO password_reset_tokens (user_id, token, expires_at)
          VALUES (?, ?, ?)
        `).bind(user.id, token, expiresAt).run();
        
        // Step 4: Test email sending
        const resetUrl = `${env.BASE_URL || 'https://soen287-project-2.pages.dev'}/reset-password.html?token=${token}`;
        
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: user.email }],
              },
            ],
            from: {
              email: 'michaelkauzman2001@hotmail.com',
              name: 'SOEN 287 Project Test',
            },
            subject: 'Test Complete Flow - Password Reset',
            content: [
              {
                type: 'text/plain',
                value: `Test complete flow. Reset URL: ${resetUrl}`,
              },
            ],
          }),
        });

        const responseText = await response.text();
        
        return new Response(JSON.stringify({
          success: response.ok,
          user: user,
          token: token,
          resetUrl: resetUrl,
          emailStatus: response.status,
          emailResponse: responseText,
          steps: {
            userLookup: 'success',
            tokenGeneration: 'success', 
            databaseInsert: 'success',
            emailSending: response.ok ? 'success' : 'failed'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          stack: error.stack
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Test user lookup endpoint for debugging
    if (url.pathname === '/api/test-user-lookup') {
      try {
        const user = await env.DB.prepare(
          'SELECT id, first_name, email, email_verified FROM users WHERE email = ? AND email_verified = TRUE'
        ).bind('michaelkauzman2001@gmail.com').first();
        
        return new Response(JSON.stringify({
          success: true,
          user: user,
          message: user ? 'User found' : 'User not found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          stack: error.stack
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Test password reset email endpoint for debugging
    if (url.pathname === '/api/test-password-reset-email') {
      try {
        // Test the email sending directly
        const resetToken = 'test-token-' + Date.now();
        const resetUrl = `${env.BASE_URL || 'https://soen287-project-2.pages.dev'}/reset-password.html?token=${resetToken}`;
        
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: 'michaelkauzman2001@gmail.com' }],
              },
            ],
            from: {
              email: 'michaelkauzman2001@hotmail.com',
              name: 'SOEN 287 Project Test',
            },
            subject: 'Test Password Reset Email',
            content: [
              {
                type: 'text/plain',
                value: `Test password reset email. Reset URL: ${resetUrl}`,
              },
            ],
          }),
        });

        const responseText = await response.text();
        
        return new Response(JSON.stringify({
          success: response.ok,
          status: response.status,
          response: responseText,
          resetUrl: resetUrl,
          sendgridConfigured: !!env.SENDGRID_API_KEY,
          message: response.ok ? 'Password reset email sent successfully' : 'Password reset email failed'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          stack: error.stack
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Test SendGrid endpoint for debugging
    if (url.pathname === '/api/test-sendgrid') {
      try {
        if (!env.SENDGRID_API_KEY) {
          return new Response(JSON.stringify({
            success: false,
            error: 'SENDGRID_API_KEY not configured'
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: 'michaelkauzman2001@hotmail.com' }],
              },
            ],
            from: {
              email: 'michaelkauzman2001@hotmail.com', // Use verified email
              name: 'SendGrid Test',
            },
            subject: 'Test Email from SendGrid',
            content: [
              {
                type: 'text/plain',
                value: 'This is a test email to debug SendGrid.',
              },
            ],
          }),
        });

        const responseText = await response.text();
        
        return new Response(JSON.stringify({
          success: response.ok,
          status: response.status,
          response: responseText,
          sendgridConfigured: !!env.SENDGRID_API_KEY,
          message: response.ok ? 'SendGrid email sent successfully' : 'SendGrid email failed'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          stack: error.stack
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get user role by email
    if (path === '/api/user-role' && request.method === 'GET') {
      return handleGetUserRole(request, env);
    }

    // Get all resources endpoint
    if (path === '/api/resources' && request.method === 'GET') {
      return handleGetResources(request, env);
    }

    // Get bookings for a specific date/category
    if (path === '/api/bookings' && request.method === 'GET') {
      return handleGetBookings(request, env);
    }

    // Create a new booking
    if (path === '/api/make-booking' && request.method === 'POST') {
      return handleMakeBooking(request, env);
    }

    // Get user's bookings
    if (path === '/api/user-bookings' && request.method === 'GET') {
      return handleGetUserBookings(request, env);
    }

    // Cancel a booking
    if (path === '/api/cancel-booking' && request.method === 'POST') {
      return handleCancelBooking(request, env);
    }

    // Toggle maintenance status for a booking slot (admin only)
    if (path === '/api/toggle-maintenance' && request.method === 'POST') {
      return handleToggleMaintenance(request, env);
    }

    // Default response for unmatched routes
    return new Response(JSON.stringify({
      success: false,
      error: 'Endpoint not found'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function handleTestPendingInsert(request, env) {
  try {
    const { firstName, lastName, email, phoneNumber, password } = await request.json();
    
    console.log('Test pending insert started with:', { firstName, lastName, email, phoneNumber });
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log('About to insert with data:', {
      firstName, lastName, email, phoneNumber, 
      passwordHashLength: passwordHash?.length,
      verificationToken, expiresAt, role: 'student'
    });
    
    const result = await env.DB.prepare(`
      INSERT INTO pending_users (first_name, last_name, email, phone_number, password_hash, verification_token, expires_at, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(firstName, lastName, email, phoneNumber, passwordHash, verificationToken, expiresAt, 'student').run();

    console.log('Database INSERT result:', result);

    return new Response(JSON.stringify({
      success: result.success,
      insertId: result.meta?.last_row_id,
      error: result.error,
      details: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Test pending insert error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleTestSendGrid(request, env) {
  try {
    const { email = 'cb2333482@icloud.com', firstName = 'Test' } = await request.json();
    
    console.log('Testing SendGrid with email:', email);
    console.log('SendGrid API Key present:', !!env.SENDGRID_API_KEY);
    console.log('Base URL:', env.BASE_URL);
    
    const verificationToken = 'test-token-123';
    const baseUrl = env.BASE_URL || 'https://soen287-project-2.pages.dev';
    const verificationUrl = `${baseUrl}/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    console.log('Verification URL:', verificationUrl);
    
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: email }],
        },
      ],
      from: {
        email: 'michaelkauzman2001@hotmail.com',
        name: 'Concordia Student Services',
      },
      subject: 'Test Email - Concordia Student Services',
      content: [
        {
          type: 'text/plain',
          value: `Hello ${firstName},\n\nThis is a test email.\n\nTest link: ${verificationUrl}\n\nBest regards,\nConcordia Student Services Team`,
        },
        {
          type: 'text/html',
          value: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #802f2f;">Test Email</h2>
                <p>Hello ${firstName},</p>
                <p>This is a test email from the registration system.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #802f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Test Link</a>
                </div>
                <p>Best regards,<br>Concordia Student Services Team</p>
            </body>
            </html>
          `,
        },
      ],
    };
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
    
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const responseText = await emailResponse.text();
    console.log('SendGrid response status:', emailResponse.status);
    console.log('SendGrid response body:', responseText);
    console.log('SendGrid response headers:', Object.fromEntries(emailResponse.headers.entries()));

    return new Response(JSON.stringify({
      success: emailResponse.ok,
      status: emailResponse.status,
      statusText: emailResponse.statusText,
      response: responseText,
      headers: Object.fromEntries(emailResponse.headers.entries()),
      emailPayload: emailPayload
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('SendGrid test error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
}
