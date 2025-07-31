const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  console.log('📧 Email Configuration:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '***configured***' : 'NOT_CONFIGURED');
  console.log('');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('❌ Email configuration missing!');
    console.log('Please update your .env file with:');
    console.log('GMAIL_USER=your_email@gmail.com');
    console.log('GMAIL_PASS=wkch qqaw qfwy wfkd');
    return;
  }
  
  try {
    console.log('🔧 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    
    console.log('📧 Sending test email...');
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to yourself for testing
      subject: "StepStunner Email Test",
      text: "This is a test email from StepStunner to verify email configuration.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d72660;">StepStunner Email Test</h2>
          <p>Hello!</p>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p>If you received this email, your Gmail configuration is working!</p>
          <p>Best regards,<br>StepStunner Team</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your email inbox for the test message.');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure GMAIL_USER is set to your Gmail address');
    console.log('2. Make sure GMAIL_PASS is set to your app password');
    console.log('3. Enable 2-factor authentication on your Gmail account');
    console.log('4. Generate an app password for this application');
  }
}

testEmail(); 