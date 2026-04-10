import { AppError } from "../middlewares/errorMiddleware.js";
import logger from "./logger.js";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";

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
        headers: { "Content-Type": "application/json" },
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
