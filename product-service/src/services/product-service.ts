import { ProductRepository } from "../repositories/product-repository.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import logger from "../lib/logger.js";
import { cache } from "../lib/cacheHelper.js";
import { ProductDTO } from "../types/productTypes.js";

export class ProductService {
  private repo: ProductRepository;

  constructor(repo?: ProductRepository) {
    this.repo = repo || new ProductRepository();
  }

  //
  async createProduct(data: ProductDTO) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw new AppError("Product slug already exists", 400);

    try {
      return await this.repo.createProduct(data);
    } catch (err: any) {
      logger.error("Repository failed to create product", { error: err });
      throw new AppError("Unable to create product at the moment", 500);
    }
  }

  async getProductById(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await cache.get<ProductDTO>(cacheKey);
    if (cached) return cached;

    const product = await this.repo.getProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    await cache.set(cacheKey, product, 300);

    return product;
  }

  // GET ALL PRODUCTS (with pagination & optional filtering)
  //   async getAllProducts(options?: { page?: number; limit?: number }) {
  //     const page = options?.page || 1;
  //     const limit = options?.limit || 20;
  //     const offset = (page - 1) * limit;

  //     const products = await this.repo.getProducts({ offset, limit });
  //     return products;
  //   }

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
