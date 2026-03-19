// src/routes/proxyRoutes.ts
import { Router, Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import logger from "../utils/logger.js";

const router = Router();

const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  product: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
  order: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
};

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const commonProxyOptions: Options<Request, Response> = {
  changeOrigin: true,
  proxyTimeout: 5000,
  timeout: 5000,

  on: {
    error: (err, req, res: any) => {
      const expressReq = req as Request;

      logger.error("Proxy Error", {
        message: err.message,
        path: expressReq.originalUrl,
      });

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Service temporarily unavailable. Please try again later.",
        });
      }
    },

    proxyReq: (proxyReq, req) => {
      const expressReq = req as AuthRequest;

      if (expressReq.headers.authorization) {
        proxyReq.setHeader("Authorization", expressReq.headers.authorization);
      }

      if (expressReq.headers["x-request-id"]) {
        proxyReq.setHeader(
          "x-request-id",
          expressReq.headers["x-request-id"] as string,
        );
      }

      if (expressReq.user?.id) {
        proxyReq.setHeader("x-user-id", expressReq.user.id);
      }
    },

    proxyRes: (proxyRes, req) => {
      const expressReq = req as Request;

      logger.info("Proxy Response", {
        path: expressReq.originalUrl,
        method: expressReq.method,
        status: proxyRes.statusCode,
      });
    },
  },
};

router.use(
  "/api/auth",
  createProxyMiddleware({
    ...commonProxyOptions,
    target: SERVICE_URLS.auth,
    pathRewrite: { "^/api/auth": "" },
  }),
);

router.use(
  "/api/products",
  createProxyMiddleware({
    ...commonProxyOptions,
    target: SERVICE_URLS.product,
    pathRewrite: { "^/api/products": "" },
  }),
);

router.use(
  "/api/orders",
  createProxyMiddleware({
    ...commonProxyOptions,
    target: SERVICE_URLS.order,
    pathRewrite: { "^/api/orders": "" },
  }),
);

export default router;
