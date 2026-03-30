import prisma from "../lib/db/postgres.js";
import { mapPrismaError } from "../lib/prismaError.js";
import {
  ProductDTO,
  GetProductsParams,
  UpdateProductDTO,
} from "../types/productTypes.js";

export class ProductRepository {
  private readonly detailSelect = {
    id: true,
    name: true,
    description: true,
    slug: true,
    basePrice: true,
    category: { select: { id: true, name: true } },
    images: {
      select: { url: true, altText: true, sortOrder: true },
      orderBy: { sortOrder: "asc" as const },
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
  };

  private buildWhereClause(params: Partial<GetProductsParams>) {
    return {
      deletedAt: null,
      ...(params.categoryId !== undefined && { categoryId: params.categoryId }),
      ...((params.minPrice !== undefined || params.maxPrice !== undefined) && {
        basePrice: {
          ...(params.minPrice !== undefined && { gte: params.minPrice }),
          ...(params.maxPrice !== undefined && { lte: params.maxPrice }),
        },
      }),
    };
  }

  async createProduct(data: ProductDTO) {
    try {
      return await prisma.product.create({
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
          variants: { include: { attributes: true } },
          images: true,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    try {
      return await prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.images !== undefined && {
            images: {
              deleteMany: {},
              create: data.images.map((img) => ({
                url: img.url,
                altText: img.altText,
                sortOrder: img.sortOrder ?? 0,
              })),
            },
          }),
        },
        include: {
          variants: { include: { attributes: true } },
          images: true,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getProductById(id: string) {
    try {
      return await prisma.product.findFirst({
        where: { id, deletedAt: null },
        select: this.detailSelect,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getProductBySlug(slug: string) {
    try {
      return await prisma.product.findFirst({
        where: { slug, deletedAt: null },
        select: this.detailSelect,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getProducts(params: GetProductsParams) {
    const { limit, skip, sortBy = "createdAt", order = "desc" } = params;
    try {
      return await prisma.product.findMany({
        take: limit,
        skip,
        where: this.buildWhereClause(params),
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          images: { take: 1, select: { url: true } },
          variants: { select: { price: true, stock: true } },
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async countProducts(params: Omit<GetProductsParams, "limit" | "skip">) {
    try {
      return await prisma.product.count({
        where: this.buildWhereClause(params),
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async existsBySlug(slug: string): Promise<boolean> {
    try {
      const count = await prisma.product.count({
        where: { slug, deletedAt: null },
      });
      return count > 0;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async deleteProduct(id: string) {
    try {
      return await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
