import { AppError } from "../middlewares/errorMiddleware.js";
import logger from "./logger.js";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";

const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";

const internalHeaders = {
  "Content-Type": "application/json",
  "x-internal-secret": INTERNAL_SECRET,
};

export interface VariantData {
  id: string;
  sku: string;
  price: number;
  stock: number;
}

export const getVariantsByIds = async (
  variantIds: string[],
): Promise<Map<string, VariantData>> => {
  try {
    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/api/products/variants/batch`,
      {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ variantIds }),
      },
    );

    if (!res.ok) {
      logger.error("Product service error", { status: res.status });
      throw new AppError("Failed to fetch product data", 502);
    }

    const json = (await res.json()) as Record<string, unknown>;

    if (!Array.isArray(json.variants)) {
      logger.error("Unexpected response from product service", { json });
      throw new AppError("Invalid response from product service", 502);
    }

    const variants = json.variants as VariantData[];
    return new Map(variants.map((v) => [v.id, v]));
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error("Product service unreachable", { err });
    throw new AppError("Product service unavailable", 503);
  }
};

export const reserveStock = async (
  variantId: string,
  quantity: number,
): Promise<boolean> => {
  try {
    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/api/products/stock/reserve`,
      {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ variantId, quantity }),
      },
    );

    if (!res.ok) {
      logger.error("Stock reservation failed", {
        status: res.status,
        variantId,
      });
      throw new AppError("Failed to reserve stock", 502);
    }

    const data = (await res.json()) as { reserved: boolean };
    return data.reserved;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error("Product service unreachable during reservation", { err });
    throw new AppError("Product service unavailable", 503);
  }
};

export const releaseStock = async (
  variantId: string,
  quantity: number,
): Promise<void> => {
  try {
    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/api/products/stock/release`,
      {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ variantId, quantity }),
      },
    );

    if (!res.ok) {
      logger.error("Stock release failed", { status: res.status, variantId });
    }
  } catch (err) {
    logger.error("Stock release error", { err, variantId });
  }
};
