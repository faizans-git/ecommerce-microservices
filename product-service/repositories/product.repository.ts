// repositories/product.repository.ts
import prisma from "../lib/db";

export class ProductRepository {
  async createProduct(data: {
    name: string;
    description?: string;
    slug: string;
    basePrice: number;
    categoryId?: string;
    variants: {
      sku: string;
      price: number;
      stock: number;
      attributes: { name: string; value: string }[];
    }[];
    images?: { url: string; altText?: string; sortOrder?: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          slug: data.slug,
          basePrice: data.basePrice,
          categoryId: data.categoryId,
        },
      });

      // create variants + attributes
      for (const variant of data.variants) {
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          },
        });

        if (variant.attributes?.length) {
          await tx.variantAttribute.createMany({
            data: variant.attributes.map((attr) => ({
              variantId: createdVariant.id,
              name: attr.name,
              value: attr.value,
            })),
          });
        }
      }

      if (data.images?.length) {
        await tx.productImage.createMany({
          data: data.images.map((img) => ({
            productId: product.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder ?? 0,
          })),
        });
      }

      return product;
    });
  }

  async getProductById(id: string) {
    return prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        basePrice: true,

        category: {
          select: { id: true, name: true },
        },

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
            attributes: {
              select: { name: true, value: true },
            },
          },
        },
      },
    });
  }

  async getProducts(params: {
    limit?: number;
    cursor?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { limit = 10, cursor, categoryId, minPrice, maxPrice } = params;

    return prisma.product.findMany({
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),

      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
        ...(minPrice && {
          basePrice: { gte: minPrice },
        }),
        ...(maxPrice && {
          basePrice: { lte: maxPrice },
        }),
      },

      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,

        images: {
          take: 1,
          select: { url: true },
        },

        variants: {
          select: {
            price: true,
            stock: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateStock(variantId: string, quantity: number) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
