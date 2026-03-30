import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product-service.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const productService = new ProductService();

export class ProductController {
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({ success: true, data: product });
  });

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) throw new AppError("Product ID is required", 400);

      const updated = await productService.updateProduct(id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError("Product ID is required", 400);

    const product = await productService.getProductById(id);

    return res.json({ success: true, data: product });
  });

  listProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getAllProducts(req.query);
    res.json(result);
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError("Product ID is required", 400);

    await productService.deleteProductById(id);
    return res.status(200).json({ success: true, message: "Product deleted" });
  });
}
