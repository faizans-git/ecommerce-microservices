import argon2 from "argon2";
import logger from "./logger.js";
const HASH_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
};
const pepper = process.env.PASSWORD_PEPPER;
if (!pepper) {
    logger.error("password pepper is not set");
    throw new Error("PASSWORD_PEPPER_NOT_SET");
}
export const hashPassword = async (plainPassword) => {
    try {
        return await argon2.hash(plainPassword + pepper, HASH_OPTIONS);
    }
    catch (error) {
        logger.error("Error while hashing password", error);
        throw new Error("Could not process password.");
    }
};
export const verifyPassword = async (hashedPassword, plainPassword) => {
    try {
        return await argon2.verify(hashedPassword, plainPassword + pepper);
    }
    catch (error) {
        logger.error("Error while verifying password", error);
        return false;
    }
};
//# sourceMappingURL=password.js.map