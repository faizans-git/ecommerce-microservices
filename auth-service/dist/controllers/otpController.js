import prisma from "../lib/prisma.js";
import logger from "../utils/logger.js";
import generateTokens from "../lib/generateToken.js";
import { generateOtp, verifyOtp } from "../lib/otpFunctions.js";
import { sendOtpEmail } from "../lib/emailService.js";
export const verifyOtpController = async (req, res) => {
    try {
        // convert to joi
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "email and OTP are required",
            });
        }
        const isValid = await verifyOtp(email, otp);
        if (!isValid) {
            logger.warn(`Invalid OTP attempt for user: ${email}`);
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }
        const user = await prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });
        const token = await generateTokens(user);
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            token,
        });
    }
    catch (err) {
        logger.error("OTP verification error", { err });
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const resendOtpController = async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
    const otp = await generateOtp(email);
    await sendOtpEmail(email, otp);
    return res.status(200).json({ success: true, message: "OTP resent" });
};
//# sourceMappingURL=otpController.js.map