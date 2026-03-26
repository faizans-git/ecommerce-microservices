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
  cursor?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}
