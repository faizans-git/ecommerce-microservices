import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product-service.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const productService = new ProductService();

export class ProductController {
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw new AppError("Product ID is required", 400);
    const updated = await productService.updateProduct(id, req.body);
    res.status(200).json({ success: true, data: updated });
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError("Product ID is required", 400);
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  });

  listProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getAllProducts(req.query);
    res.json(result);
  });

  getVariantsBatch = asyncHandler(async (req: Request, res: Response) => {
    const { variantIds } = req.body as { variantIds: unknown };

    if (!Array.isArray(variantIds) || variantIds.length === 0) {
      throw new AppError("variantIds must be a non-empty array", 400);
    }
    if (!variantIds.every((id) => typeof id === "string")) {
      throw new AppError("All variantIds must be strings", 400);
    }
    if (variantIds.length > 100) {
      throw new AppError("Cannot fetch more than 100 variants at once", 400);
    }

    const variants = await productService.getVariantsByIds(
      variantIds as string[],
    );
    res.status(200).json({ success: true, variants });
  });

  reserveStock = asyncHandler(async (req: Request, res: Response) => {
    const { variantId, quantity } = req.body as {
      variantId: unknown;
      quantity: unknown;
    };

    if (typeof variantId !== "string" || !variantId) {
      throw new AppError("variantId must be a string", 400);
    }
    if (typeof quantity !== "number" || quantity < 1) {
      throw new AppError("quantity must be a positive number", 400);
    }

    const reserved = await productService.reserveStock(variantId, quantity);
    res.status(200).json({ success: true, reserved });
  });

  releaseStock = asyncHandler(async (req: Request, res: Response) => {
    const { variantId, quantity } = req.body as {
      variantId: unknown;
      quantity: unknown;
    };

    if (typeof variantId !== "string" || !variantId) {
      throw new AppError("variantId must be a string", 400);
    }
    if (typeof quantity !== "number" || quantity < 1) {
      throw new AppError("quantity must be a positive number", 400);
    }

    await productService.releaseStock(variantId, quantity);
    res.status(200).json({ success: true });
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError("Product ID is required", 400);
    await productService.deleteProductById(id);
    res.status(200).json({ success: true, message: "Product deleted" });
  });
}
