export interface VariantAttributeDTO {
  name: string;
  value: string;
}

export interface VariantDTO {
  sku: string;
  price: number;
  stock: number;
  attributes?: VariantAttributeDTO[];
}

export interface ImageDTO {
  url: string;
  altText?: string;
  sortOrder?: number;
}

export interface ProductDTO {
  name: string;
  description?: string;
  slug: string;
  basePrice: number;
  categoryId?: string;
  variants: VariantDTO[];
  images?: ImageDTO[];
}

export interface GetProductsParams {
  limit?: number;
  skip?: number;
  page?: number;

  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;

  sortBy?: "createdAt" | "basePrice" | "name";
  order?: "asc" | "desc";
}

export interface ProductListResponse {
  data: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string }[];
    variants: { price: number; stock: number }[];
  }[];

  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  slug?: string;
  basePrice?: number;
  categoryId?: string;
  images?: { url: string; altText?: string; sortOrder?: number }[];
}
