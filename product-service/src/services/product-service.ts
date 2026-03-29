import { ProductRepository } from "../repositories/product-repository.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import logger from "../lib/logger.js";
import { cache } from "../lib/cacheHelper.js";
import {
  GetProductsParams,
  ProductDTO,
  ProductListResponse,
} from "../types/productTypes.js";

export class ProductService {
  private repo: ProductRepository;

  constructor(repo?: ProductRepository) {
    this.repo = repo || new ProductRepository();
  }

  //
  async createProduct(data: ProductDTO) {
    const existing = await this.repo.existsBySlug(data.slug);
    if (existing) throw new AppError("Product slug already exists", 400);

    try {
      return await this.repo.createProduct(data);
    } catch (err: any) {
      logger.error(`Repository failed to create product: ${err}`);
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

  async getAllProducts(options?: GetProductsParams) {
    const cacheKey = `products:list:${JSON.stringify(options || {})}`;
    const cachedData = await cache.get<ProductListResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const filters = {
      categoryId: options?.categoryId,
      minPrice: options?.minPrice,
      maxPrice: options?.maxPrice,
    };

    const [products, total] = await Promise.all([
      this.repo.getProducts({
        skip: offset,
        limit,
        ...filters,
        sortBy: options?.sortBy,
        order: options?.order,
      }),
      this.repo.countProducts(filters),
    ]);

    const result = {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await cache.set(cacheKey, result, 300);
    return result;
  }

  async deleteProductById(id: string) {
    const deleted = await this.repo.deleteProduct(id);
    if (!deleted) {
      throw new AppError("Product not found", 404);
    }
    await cache.del(`product:${id}`);
    return deleted;
  }
}
