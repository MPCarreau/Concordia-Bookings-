// Email service implementation for password reset and email verification
// Uses SendGrid as primary provider

// Main email sending function for password reset
async function sendPasswordResetEmail(userEmail, firstName, resetToken, env) {
  try {
    console.log('=== PASSWORD RESET EMAIL DEBUG ===');
    console.log('Attempting to send password reset email via SendGrid...');
    console.log('SENDGRID_API_KEY available:', !!env.SENDGRID_API_KEY);
    console.log('SENDGRID_API_KEY length:', env.SENDGRID_API_KEY ? env.SENDGRID_API_KEY.length : 'undefined');
    console.log('Sending password reset email to:', userEmail);
    console.log('User firstName:', firstName);
    console.log('Reset token:', resetToken);
    
    if (!env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured in environment variables');
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const baseUrl = env.BASE_URL || 'https://soen287project4-production.up.railway.app';
    const resetUrl = `${baseUrl}/reset-password.html?token=${resetToken}`;
    
    console.log('Base URL:', baseUrl);
    console.log('Reset URL:', resetUrl);
    
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: userEmail }],
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
          value: `Hello ${firstName},\n\nPlease click this link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nBest regards,\nSOEN 287 Project Team`,
        },
        {
          type: 'text/html',
          value: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p>Hello ${firstName},</p>
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
    };
    
    console.log('Email payload prepared:', JSON.stringify(emailPayload, null, 2));
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('SendGrid response status:', response.status);
    console.log('SendGrid response ok:', response.ok);

    console.log('SendGrid response status:', response.status);
    console.log('SendGrid response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('SendGrid password reset error:', response.status, errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    console.log('Password reset email sent successfully via SendGrid');
    return { success: true, provider: 'SendGrid' };
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Email verification sending function
async function sendEmailVerification(userEmail, firstName, verificationToken, env) {
  try {
    console.log('=== EMAIL VERIFICATION DEBUG ===');
    console.log('Attempting to send verification email via SendGrid...');
    console.log('SENDGRID_API_KEY available:', !!env.SENDGRID_API_KEY);
    console.log('SENDGRID_API_KEY length:', env.SENDGRID_API_KEY ? env.SENDGRID_API_KEY.length : 'undefined');
    console.log('Sending verification email to:', userEmail);
    console.log('User firstName:', firstName);
    console.log('Verification token:', verificationToken);
    
    if (!env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured in environment variables');
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const baseUrl = env.BASE_URL || 'https://soen287project4-production.up.railway.app';
    const verificationUrl = `${baseUrl}/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`;
    
    console.log('Base URL:', baseUrl);
    console.log('Verification URL:', verificationUrl);
    
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
      subject: 'Verify Your Account - Concordia Student Services',
      content: [
        {
          type: 'text/plain',
          value: `Hello ${firstName},

Thank you for registering with Concordia Student Services!

Please click this link to verify your account:
${verificationUrl}

This link expires in 24 hours.

Please disregard this email if you did not create this account.

Best regards,
Concordia Student Services Team`,
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
                <p>Please disregard this email if you did not create this account.</p>
                <p>Best regards,<br>Concordia Student Services Team</p>
            </body>
            </html>
          `,
        },
      ],
    };
    
    console.log('Email payload prepared:', JSON.stringify(emailPayload, null, 2));
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('SendGrid response status:', response.status);
    console.log('SendGrid response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('SendGrid verification email error:', response.status, errorData);
      console.error('Full error response:', errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    const responseData = await response.text();
    console.log('SendGrid success response:', responseData);
    console.log('Verification email sent successfully via SendGrid to:', userEmail);
    console.log('=== EMAIL VERIFICATION DEBUG END ===');
    
    return { success: true, provider: 'SendGrid', details: responseData };
  } catch (error) {
    console.error('=== EMAIL VERIFICATION ERROR ===');
    console.error('Verification email sending failed:', error);
    console.error('Error stack:', error.stack);
    console.error('=== EMAIL VERIFICATION ERROR END ===');
    return { success: false, error: error.message };
  }
}

// Booking approved notification email
async function sendBookingApprovedEmail(userEmail, firstName, resourceName, bookingDate, timeSlot, env) {
  try {
    console.log('=== BOOKING APPROVED EMAIL DEBUG ===');
    console.log('Sending booking approval email to:', userEmail);
    console.log('Resource:', resourceName, 'Date:', bookingDate, 'Time:', timeSlot);
    
    if (!env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured in environment variables');
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const baseUrl = env.BASE_URL || 'https://soen287project4-production.up.railway.app';
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
      subject: '✅ Booking Confirmed - Concordia Student Services',
      content: [
        {
          type: 'text/plain',
          value: `Hello ${firstName},\n\nGreat news! Your booking request has been approved.\n\nBooking Details:\n- Resource: ${resourceName}\n- Date: ${bookingDate}\n- Time: ${timeSlot}\n\nYour booking is now confirmed and reserved. Please arrive on time for your scheduled slot.\n\nView your bookings at: ${bookingsUrl}\n\nBest regards,\nConcordia Student Services Team`,
        },
        {
          type: 'text/html',
          value: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
                    <h2 style="margin: 0; color: white;">✅ Booking Confirmed!</h2>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
                    <p>Hello ${firstName},</p>
                    <p><strong>Great news!</strong> Your booking request has been approved.</p>
                    
                    <div style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #4CAF50;">Booking Details</h3>
                        <p style="margin: 8px 0;"><strong>Resource:</strong> ${resourceName}</p>
                        <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
                        <p style="margin: 8px 0;"><strong>Time:</strong> ${timeSlot}</p>
                    </div>
                    
                    <p><strong>What's Next?</strong></p>
                    <ul>
                        <li>Your booking is now confirmed and reserved</li>
                        <li>Please arrive on time for your scheduled slot</li>
                        <li>View your bookings anytime in your account</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${bookingsUrl}" style="background-color: #802f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View My Bookings</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">If you need to cancel or modify your booking, please contact us as soon as possible.</p>
                    <p>Best regards,<br>Concordia Student Services Team</p>
                </div>
            </body>
            </html>
          `,
        },
      ],
    };
    
    console.log('Email payload prepared for booking approval');
    
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
      console.error('SendGrid booking approval email error:', response.status, errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    console.log('Booking approval email sent successfully via SendGrid');
    return { success: true, provider: 'SendGrid' };
  } catch (error) {
    console.error('Booking approval email sending failed:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Booking rejected notification email
async function sendBookingRejectedEmail(userEmail, firstName, resourceName, bookingDate, timeSlot, env) {
  try {
    console.log('=== BOOKING REJECTED EMAIL DEBUG ===');
    console.log('Sending booking rejection email to:', userEmail);
    console.log('Resource:', resourceName, 'Date:', bookingDate, 'Time:', timeSlot);
    
    if (!env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured in environment variables');
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const baseUrl = env.BASE_URL || 'https://soen287project4-production.up.railway.app';
    const makeBookingUrl = `${baseUrl}/makeBooking.html`;
    
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
      subject: 'Booking Request Update - Concordia Student Services',
      content: [
        {
          type: 'text/plain',
          value: `Hello ${firstName},\n\nWe wanted to let you know about your recent booking request.\n\nRequest Details:\n- Resource: ${resourceName}\n- Date: ${bookingDate}\n- Time: ${timeSlot}\n\nUnfortunately, we were unable to approve your booking request at this time. \n\nYou can try booking a different time slot or check out alternative resources at: ${makeBookingUrl}\n\nIf you have questions, please contact us.\n\nBest regards,\nConcordia Student Services Team`,
        },
        {
          type: 'text/html',
          value: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #ff9800; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
                    <h2 style="margin: 0; color: white;">Booking Request Update</h2>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
                    <p>Hello ${firstName},</p>
                    <p>We wanted to let you know about your recent booking request.</p>
                    
                    <div style="background-color: white; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #ff9800;">Request Details</h3>
                        <p style="margin: 8px 0;"><strong>Resource:</strong> ${resourceName}</p>
                        <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
                        <p style="margin: 8px 0;"><strong>Time:</strong> ${timeSlot}</p>
                    </div>
                    
                    <p>Unfortunately, we were unable to approve your booking request at this time. This could be due to:</p>
                    <ul>
                        <li>The resource is no longer available for that time slot</li>
                        <li>Conflicting bookings or maintenance schedules</li>
                        <li>Capacity or eligibility requirements</li>
                    </ul>
                    
                    <p><strong>What You Can Do:</strong></p>
                    <ul>
                        <li>Try booking a different time slot for the same resource</li>
                        <li>Check out alternative resources that may suit your needs</li>
                        <li>Contact us if you have questions about this decision</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${makeBookingUrl}" style="background-color: #802f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Browse Available Resources</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">We appreciate your understanding and hope to serve you in the future.</p>
                    <p>Best regards,<br>Concordia Student Services Team</p>
                </div>
            </body>
            </html>
          `,
        },
      ],
    };
    
    console.log('Email payload prepared for booking rejection');
    
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
      console.error('SendGrid booking rejection email error:', response.status, errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    console.log('Booking rejection email sent successfully via SendGrid');
    return { success: true, provider: 'SendGrid' };
  } catch (error) {
    console.error('Booking rejection email sending failed:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

export { sendPasswordResetEmail, sendEmailVerification, sendBookingApprovedEmail, sendBookingRejectedEmail };