import logger from "../utils/logger.js";
const errorHandler = (error, req, res, next) => {
    logger.error(error);
    const isProd = process.env.NODE_ENV === "production";
    res.status(error.status || 500).json({
        message: !isProd ? error.message : "Internal server error occurred",
    });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map