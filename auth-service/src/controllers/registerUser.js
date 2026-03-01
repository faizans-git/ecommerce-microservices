import { validateRegistrationData } from "../requestDataValidators/validateData";
import logger from "../utils/logger";

const registerUser = async (req, res) => {
  logger.info("User registration endpoint hit.");
  try {
    const { username, email, password } = req.body;
    const { error } = validateRegistrationData(req.body);
    if (error) {
      logger.warn("Validation error", error);
      return res.status(400).json({
        success: false,
        message: "Input data is not according to schema",
      });
    }
  } catch (error) {
    logger.error(`Error occured while user registration ${error}`);
    return res.status(500).json({
      success: false,
      message: "An unknnown server error occured",
    });
  }
};
