// src/services/product.service.ts
import { ProductRepository } from "../repositories/product-repository.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import logger from "../lib/logger.js";

export class ProductService {
  private repo: ProductRepository;

  constructor(repo?: ProductRepository) {
    // Allows dependency injection for testing
    this.repo = repo || new ProductRepository();
  }

  async createProduct(data: any) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) {
      logger.warn("Attempted to create product with duplicate slug", {
        slug: data.slug,
      });
      throw new AppError("Product slug already exists", 400);
    }

    return this.repo.createProduct(data);
  }

  // GET SINGLE PRODUCT
  async getProductById(id: string) {
    const product = await this.repo.getProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  // GET ALL PRODUCTS (with pagination & optional filtering)
  async getAllProducts(options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const products = await this.repo.getAllProducts({ offset, limit });
    return products;
  }

  async updateProduct(id: string, data: any) {
    const product = await this.repo.getProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (data.slug && data.slug !== product.slug) {
      const slugExists = await this.repo.findBySlug(data.slug);
      if (slugExists) {
        throw new AppError("Product slug already exists", 400);
      }
    }

    return this.repo.updateProduct(id, data);
  }

  async deleteProductById(id: string) {
    const deleted = await this.repo.deleteProduct(id);
    if (!deleted) {
      throw new AppError("Product not found", 404);
    }
    return deleted;
  }
}
