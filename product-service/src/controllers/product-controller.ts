// src/controllers/products/product.controller.ts
import { Request, Response } from "express";
import { ProductService } from "../../services/product.service";

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response) {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({ success: true, data: product });
  }

  async getProductById(req: Request, res: Response) {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, data: product });
  }

  async listProducts(req: Request, res: Response) {
    const products = await productService.getProducts(req.query);
    return res.json({ success: true, data: products });
  }

  async deleteProduct(req: Request, res: Response) {
    await productService.deleteProduct(req.params.id);
    return res.json({ success: true, message: "Product deleted" });
  }
}
