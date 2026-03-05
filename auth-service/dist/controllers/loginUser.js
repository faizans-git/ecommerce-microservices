import checkExistance from "../lib/checkExistance.js";
import { validateLoginData } from "../requestDataValidators/validateData.js";
import logger from "../utils/logger.js";
import { verifyPassword } from "../utils/password.js";
import generateTokens from "../lib/generateToken.js";
const loginUser = async (req, res) => {
    try {
        const { value, error } = validateLoginData(req.body);
        const { email, password } = value;
        if (error) {
            logger.warn(`User login input is not according to schema ${error}`);
            return res.status(400).json({
                success: false,
                message: "Input data is not according to schema",
            });
        }
        const userExists = await checkExistance(email);
        if (!userExists) {
            logger.error(`User with these credentials does not exist: ${email}`);
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        const passwordVerified = await verifyPassword(userExists.password, password);
        if (!passwordVerified) {
            logger.error(`Wrong credentials for: ${email}`);
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        const { jwtToken, refreshToken } = await generateTokens(userExists);
        return res.status(201).json({
            success: true,
            message: "Successfully logged in.",
            jwtToken,
            refreshToken,
        });
    }
    catch (error) {
        logger.error("Error occured while user login", { error });
        return res.status(500).json({
            success: false,
            message: "An unknnown server error occurred.Please try again later.",
        });
    }
};
export default loginUser;
//# sourceMappingURL=loginUser.js.map