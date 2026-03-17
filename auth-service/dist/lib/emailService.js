import { transporter } from "../utils/mailerUtil.js";
export const sendOtpEmail = async (email, otp) => {
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
//# sourceMappingURL=emailService.js.map