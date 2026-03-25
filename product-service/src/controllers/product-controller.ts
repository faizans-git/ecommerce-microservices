// src/controllers/products/product.controller.ts
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

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError("Product ID is required", 400);

    const product = await productService.getProductById(id);
    if (!product) throw new AppError("Product not found", 404);

    return res.json({ success: true, data: product });
  });

  // listProducts = asyncHandler(async (req: Request, res: Response) => {
  //   const pageStr = Array.isArray(req.query.page)
  //     ? req.query.page[0]
  //     : req.query.page;
  //   const limitStr = Array.isArray(req.query.limit)
  //     ? req.query.limit[0]
  //     : req.query.limit;

  //   const page = pageStr ? Number(pageStr) : undefined;
  //   const limit = limitStr ? Number(limitStr) : undefined;

  //   const products = await productService.getAllProducts({ page, limit });
  //   return res.json({ success: true, data: products });
  // });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError("Product ID is required", 400);

    await productService.deleteProductById(id);
    return res.json({ success: true, message: "Product deleted" });
  });
}
