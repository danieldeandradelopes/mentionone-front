export interface Product {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  price: number;
  stock?: number;
  type: "physical" | "digital";
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  image_url?: string;
  price: number;
  stock?: number;
  type: "physical" | "digital";
  category?: string;
}

export interface UpdateProductRequest {
  id: number;
  title?: string;
  description?: string;
  image_url?: string;
  price?: number;
  stock?: number;
  type?: "physical" | "digital";
  category?: string;
}

export default Product;
