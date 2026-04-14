import { transporter } from "../utils/mailerUtil.js";

export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `"Eccomerce Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
): Promise<void> => {
  await transporter.sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset. This link expires in 15 minutes.</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, ignore this email — your password won't change.</p>
    `,
  });
};
