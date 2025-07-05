const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Email Configuration (Development Mode)');
    return null;
  }

  const account = await nodemailer.createTestAccount();
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
};

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = await createTransporter();
    
    if (!transporter) {
      console.log('📧 Verification Email (Development Mode):');
      console.log('To:', email);
      console.log('Token:', token);
      console.log('Verification URL:', `${process.env.CLIENT_URL}/verify-email?token=${token}`);
      return { success: true };
    }
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@prepfire.com',
      to: email,
      subject: 'Verify Your PrepFire Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00ffff;">Welcome to PrepFire!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00ffff, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = await createTransporter();
    
    if (!transporter) {
      console.log('📧 Password Reset Email (Development Mode):');
      console.log('To:', email);
      console.log('Token:', token);
      console.log('Reset URL:', `${process.env.CLIENT_URL}/reset-password?token=${token}`);
      return { success: true };
    }
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@prepfire.com',
      to: email,
      subject: 'Reset Your PrepFire Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00ffff;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00ffff, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = await createTransporter();
    
    if (!transporter) {
      console.log('📧 Welcome Email (Development Mode):');
      console.log('To:', email);
      console.log('Name:', name);
      return { success: true };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@prepfire.com',
      to: email,
      subject: 'Welcome to PrepFire!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00ffff;">Welcome to PrepFire, ${name}!</h2>
          <p>Your account has been successfully created. Start your coding journey today!</p>
          <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #fff; margin-top: 0;">Get Started:</h3>
            <ul style="color: #ccc;">
              <li>✨ Practice with AI-generated problems</li>
              <li>📊 Track your progress and stats</li>
              <li>🏆 Compete on the leaderboard</li>
              <li>🎯 Get personalized recommendations</li>
            </ul>
          </div>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00ffff, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Start Coding
          </a>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};