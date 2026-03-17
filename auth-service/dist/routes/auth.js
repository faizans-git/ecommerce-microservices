import { Router } from "express";
import registerUser from "../controllers/registerUser.js";
import loginUser from "../controllers/loginUser.js";
import logoutUser from "../controllers/logoutUser.js";
import { resendOtpController, verifyOtpController, } from "../controllers/otpController.js";
const router = Router();
router.post("/register-user", registerUser);
router.post("/resend-otp", resendOtpController);
router.post("/verify-otp", verifyOtpController);
router.post("/login-user", loginUser);
router.post("/logout-user", logoutUser);
export default router;
//# sourceMappingURL=auth.js.map