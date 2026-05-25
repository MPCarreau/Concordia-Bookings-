// Test function to verify SendGrid email sending
// This can be used to test email functionality independently

export async function testSendGridEmail(env) {
  try {
    console.log('=== TESTING SENDGRID EMAIL ===');
    console.log('SENDGRID_API_KEY available:', !!env.SENDGRID_API_KEY);
    
    if (!env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not found in environment variables');
    }

    const testEmail = 'michaelkauzman2001@hotmail.com'; // Your test email
    const testPayload = {
      personalizations: [
        {
          to: [{ email: testEmail }],
        },
      ],
      from: {
        email: 'michaelkauzman2001@hotmail.com',
        name: 'SOEN 287 Test',
      },
      subject: 'Test Email - SendGrid Configuration',
      content: [
        {
          type: 'text/html',
          value: `
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>SendGrid Test Email</h2>
                <p>This is a test email to verify SendGrid configuration.</p>
                <p>If you receive this email, SendGrid is working correctly!</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
            </body>
            </html>
          `,
        },
        {
          type: 'text/plain',
          value: `SendGrid Test Email\n\nThis is a test email to verify SendGrid configuration.\nIf you receive this email, SendGrid is working correctly!\n\nTimestamp: ${new Date().toISOString()}`,
        },
      ],
    };

    console.log('Sending test email to:', testEmail);
    console.log('Test payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('SendGrid test error:', response.status, errorData);
      throw new Error(`SendGrid test failed: ${response.status} - ${errorData}`);
    }

    const responseData = await response.text();
    console.log('SendGrid test success:', responseData);
    console.log('=== SENDGRID TEST COMPLETED SUCCESSFULLY ===');
    
    return { success: true, response: responseData };
  } catch (error) {
    console.error('=== SENDGRID TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Alternative test using simpler email format
export async function testSimpleEmail(env, targetEmail = 'michaelkauzman2001@hotmail.com') {
  try {
    console.log('=== TESTING SIMPLE EMAIL ===');
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: targetEmail }] }],
        from: { email: 'michaelkauzman2001@hotmail.com', name: 'Test' },
        subject: 'Simple Test Email',
        content: [{ type: 'text/plain', value: 'This is a simple test email.' }]
      }),
    });

    console.log('Simple email response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Simple email sent successfully!');
      return { success: true };
    } else {
      const error = await response.text();
      console.error('❌ Simple email failed:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ Simple email exception:', error);
    return { success: false, error: error.message };
  }
}