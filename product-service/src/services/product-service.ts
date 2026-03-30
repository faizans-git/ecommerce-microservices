import { ProductRepository } from "../repositories/product-repository.js";
import { cache } from "../lib/cacheHelper.js";
import {
  GetProductsParams,
  ProductDTO,
  ProductListResponse,
  UpdateProductDTO,
} from "../types/productTypes.js";
import { AppError } from "../middlewares/errorMiddleware.js";

export class ProductService {
  private repo: ProductRepository;

  constructor(repo?: ProductRepository) {
    this.repo = repo || new ProductRepository();
  }

  private buildListCacheKey(options?: GetProductsParams): string {
    const params = {
      page: options?.page ?? 1,
      limit: options?.limit ?? 20,
      sortBy: options?.sortBy ?? "createdAt",
      order: options?.order ?? "desc",
      categoryId: options?.categoryId ?? null,
      minPrice: options?.minPrice ?? null,
      maxPrice: options?.maxPrice ?? null,
    };
    return `products:list:p${params.page}:l${params.limit}:s${params.sortBy}:o${params.order}:c${params.categoryId}:min${params.minPrice}:max${params.maxPrice}`;
  }

  async createProduct(data: ProductDTO) {
    const existing = await this.repo.existsBySlug(data.slug);
    if (existing) throw new AppError("Product slug already exists", 400);

    const createdProduct = await this.repo.createProduct(data);
    await cache.deletePattern(`products:list:*`);
    return createdProduct;
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await this.repo.getProductById(id);
    if (!product) throw new AppError("Product not found", 404);

    if (data.slug && data.slug !== product.slug) {
      const slugTaken = await this.repo.existsBySlug(data.slug);
      if (slugTaken) throw new AppError("Product slug already exists", 400);
    }

    const updated = await this.repo.updateProduct(id, data);
    await Promise.all([
      cache.del(`product:${id}`),
      cache.deletePattern("products:list:*"),
    ]);
    return updated;
  }

  async getProductById(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await cache.get<ProductDTO>(cacheKey);
    if (cached) return cached;

    const product = await this.repo.getProductById(id);
    if (!product) throw new AppError("Product not found", 404);

    await cache.set(cacheKey, product, 300);
    return product;
  }

  async getAllProducts(options?: GetProductsParams) {
    const cacheKey = this.buildListCacheKey(options);
    const cachedData = await cache.get<ProductListResponse>(cacheKey);
    if (cachedData) return cachedData;

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
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
    await Promise.all([
      cache.del(`product:${id}`),
      cache.deletePattern("products:list:*"),
    ]);
    return deleted;
  }
}
