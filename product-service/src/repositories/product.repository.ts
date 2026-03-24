// repositories/product.repository.ts
import prisma from "../lib/db.js";

// --- DTOs / Type definitions ---
interface VariantAttributeDTO {
  name: string;
  value: string;
}

interface VariantDTO {
  sku: string;
  price: number;
  stock: number;
  attributes?: VariantAttributeDTO[];
}

interface ImageDTO {
  url: string;
  altText?: string;
  sortOrder?: number;
}

interface CreateProductDTO {
  name: string;
  description?: string;
  slug: string;
  basePrice: number;
  categoryId?: string;
  variants: VariantDTO[];
  images?: ImageDTO[];
}

interface GetProductsParams {
  limit?: number;
  cursor?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class ProductRepository {
  async createProduct(data: CreateProductDTO) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        variants: {
          create: data.variants.map((variant) => ({
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            attributes: {
              create: variant.attributes?.map((attr) => ({
                name: attr.name,
                value: attr.value,
              })),
            },
          })),
        },
        images: {
          create: data.images?.map((img) => ({
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder ?? 0,
          })),
        },
      },
      include: {
        variants: {
          include: {
            attributes: true,
          },
        },
        images: true,
      },
    });
  }

  // --- Get single product by ID ---
  async getProductById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        basePrice: true,
        category: { select: { id: true, name: true } },
        images: {
          select: { url: true, altText: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            stock: true,
            attributes: { select: { name: true, value: true } },
          },
        },
      },
    });
  }

  // --- Get multiple products with filters & pagination ---
  async getProducts(params: GetProductsParams) {
    const { limit = 10, cursor, categoryId, minPrice, maxPrice } = params;

    return prisma.product.findMany({
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
        ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
        ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: { take: 1, select: { url: true } },
        variants: { select: { price: true, stock: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Update stock safely (prevents negative stock)
  async updateStock(variantId: string, quantity: number) {
    return prisma.productVariant.updateMany({
      where: { id: variantId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
