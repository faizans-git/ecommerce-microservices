import { Router, Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import logger from "../utils/logger.js";
import { authenticate } from "../middlewares/auth.js";
import { signUserHeaders } from "../utils/signHeaders.js";
import { authLimiter, generalLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  product: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
  order: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
};

const PUBLIC_PATHS = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/verify-otp",
  "/api/auth/resend-otp",
];

const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (PUBLIC_PATHS.some((p) => req.originalUrl.startsWith(p))) return next();
  return authenticate(req, res, next);
};

const commonProxyOptions: Options<Request, Response> = {
  changeOrigin: true,
  proxyTimeout: 5000,
  timeout: 5000,

  on: {
    error: (err, req, res: any) => {
      logger.error("Proxy Error", {
        message: err.message,
        path: (req as Request).originalUrl,
      });

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Service temporarily unavailable. Please try again later.",
        });
      }
    },

    proxyReq: (proxyReq, req) => {
      const expressReq = req as Request;

      proxyReq.removeHeader("authorization");

      if (expressReq.user) {
        const { userId, email, role } = expressReq.user;
        const sig = signUserHeaders(userId, email, role);

        proxyReq.setHeader("x-user-id", userId);
        proxyReq.setHeader("x-user-email", email);
        proxyReq.setHeader("x-user-role", role);
        proxyReq.setHeader("x-gateway-signature", sig);
      }

      if (expressReq.headers["x-request-id"]) {
        proxyReq.setHeader(
          "x-request-id",
          expressReq.headers["x-request-id"] as string,
        );
      }
    },

    proxyRes: (proxyRes, req) => {
      logger.info("Proxy Response", {
        path: (req as Request).originalUrl,
        method: (req as Request).method,
        status: proxyRes.statusCode,
      });
    },
  },
};

router.use(
  "/auth",
  optionalAuth,
  authLimiter,
  createProxyMiddleware({
    ...commonProxyOptions,
    target: SERVICE_URLS.auth,
    pathRewrite: { "^/auth": "" },
  }),
);

router.use(
  "/products",
  optionalAuth,
  generalLimiter,
  createProxyMiddleware({
    ...commonProxyOptions,
    target: SERVICE_URLS.product,
    pathRewrite: { "^/products": "" },
  }),
);

router.use(
  "/orders",
  authenticate,
  generalLimiter,
  createProxyMiddleware({
    ...commonProxyOptions,
    target: SERVICE_URLS.order,
    pathRewrite: { "^/orders": "" },
  }),
);

export default router;
