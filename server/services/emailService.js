import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TechVerse ERP <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'Your OTP - TechVerse ERP',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">TechVerse University</h2>
        <p style="color: #374151; font-size: 14px;">Your verification code is:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset - TechVerse ERP',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">TechVerse University</h2>
        <p style="color: #374151; font-size: 14px;">You requested a password reset. Click the button below:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this, ignore this email. This link expires in 1 hour.</p>
      </div>
    `,
  });
};

export default sendEmail;
