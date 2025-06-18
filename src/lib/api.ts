// lib/api.ts
import { Product, CreateOrderData , DeliverySchedule, } from '@/types';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fonction pour nettoyer les paramètres (exclure Symbol, null, undefined)
function sanitizeParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) =>
        typeof value !== 'symbol' && value !== undefined && value !== null
      )
      .map(([key, value]) => [key, String(value)])
  );
}

export const fetchProducts = async (params: Record<string, any> = {}, token?: string): Promise<Product[]> => {
  const cleanParams = sanitizeParams(params);
  const query = new URLSearchParams(cleanParams).toString();

  const res = await fetch(`${API_URL}/api/products/?${query}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
};

export const fetchProduct = async (id: string, token?: string): Promise<Product> => {
  const res = await fetch(`${API_URL}/api/products/${id}/`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }

  return res.json();
};

export const createProduct = async (data: FormData, token: string): Promise<Product> => {
  const res = await fetch(`${API_URL}/api/products/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error('Failed to create product');
  }

  return res.json();
};

export const placeOrder = async (
  productId: number,
  data: CreateOrderData,
  token: string
): Promise<any> => {
  const res = await fetch(`${API_URL}/api/products/${productId}/place_order/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to place order');
  }

  return res.json();
};
