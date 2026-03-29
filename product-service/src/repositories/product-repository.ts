import prisma from "../lib/db/postgres.js";
import { mapPrismaError } from "../lib/prismaError.js";
import { ProductDTO, GetProductsParams } from "../types/productTypes.js";

export class ProductRepository {
  async createProduct(data: ProductDTO) {
    try {
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
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

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

  async getProducts(params: GetProductsParams) {
    const {
      limit,
      skip,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
    } = params;

    return prisma.product.findMany({
      take: limit,
      skip,
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
        ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
        ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
      },
      orderBy: {
        [sortBy]: order,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: { take: 1, select: { url: true } },
        variants: { select: { price: true, stock: true } },
      },
    });
  }

  async countProducts(params: Omit<GetProductsParams, "limit" | "skip">) {
    const { categoryId, minPrice, maxPrice } = params;

    return prisma.product.count({
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
        ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
        ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
      },
    });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: {
        slug,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async deleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
