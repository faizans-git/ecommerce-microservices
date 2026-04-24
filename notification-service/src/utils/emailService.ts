import { transporter } from "./mailerUtil.js";

const FROM = `"Ecommerce Support" <${process.env.EMAIL_USER}>`;

export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your verification code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2>Email Verification</h2>
        <p>Your one-time code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f5f5f5;text-align:center">
          ${otp.replace(/[<>&"]/g, "")}
        </div>
        <p style="color:#666;font-size:13px">This code expires in 5 minutes. Do not share it.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2>Password Reset</h2>
        <p>You requested a password reset. This link expires in 15 minutes.</p>
        <p><a href="${resetUrl}" style="background:#1a56db;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px">Reset Password</a></p>
        <p style="color:#666;font-size:13px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
