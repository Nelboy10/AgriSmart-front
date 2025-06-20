import { Product, CreateOrderData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');

function sanitizeParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && typeof value !== 'symbol')
      .map(([key, value]) => [key, value instanceof Date ? value.toISOString() : String(value)])
  );
}

const getAuthHeaders = (token?: string) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.detail || errorData?.message || 'Erreur serveur';
    throw new Error(message);
  }
  return res.json();
};

// Helpers génériques (facultatifs mais utiles si tu veux simplifier plus tard)
const get = async <T>(path: string, token?: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(res);
};


const post = async <T>(path: string, body: any, token?: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

const putForm = async <T>(path: string, formData: FormData, token: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: formData,
  });
  return handleResponse(res);
};

const patch = async <T>(path: string, data: Partial<T>, token: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const fetchProducts = async (params: Record<string, any> = {}, token?: string): Promise<Product[]> => {
  const cleanParams = sanitizeParams(params);
  const query = new URLSearchParams(cleanParams).toString();
  return get<Product[]>(`/api/products/?${query}`, token);
};

export const fetchProduct = async (id: string, token?: string): Promise<Product> => {
  return get<Product>(`/api/products/${id}/`, token);
};

export const createProduct = async (data: FormData, token: string): Promise<Product> => {
  const res = await fetch(`${API_URL}/api/products/`, {
    method: 'POST',
    headers: getAuthHeaders(token), // Ne pas inclure 'Content-Type' pour FormData
    body: data,
  });
  return handleResponse(res);
};

export const updateProduct = async (id: number, data: FormData, token: string): Promise<Product> => {
  return putForm<Product>(`/api/products/${id}/`, data, token);
};

export const patchProduct = async (id: number, data: Partial<Product>, token: string): Promise<Product> => {
  return patch<Product>(`/api/products/${id}/`, data, token);
};

export const placeOrder = async (
  productId: number,
  data: CreateOrderData,
  token: string
): Promise<any> => {
  return post<any>(`/api/products/${productId}/place_order/`, data, token);
};
export const fetchOrders = async (token?: string): Promise<any[]> => {
  return get<any[]>('/api/orders/', token);
}

export const fetchOrderDetail = async (id: string, token?: string): Promise<any> => {
  return get<any>(`/api/orders/${id}/`, token);
}
export const fetchDeliverySchedules = async (farmerId: number, token?: string): Promise<any[]> => {
  return get<any[]>(`/api/delivery-schedules/?farmer=${farmerId}`, token);
};
// Actions pour les commandes
export const approveOrder = async (orderId: number, token: string, notes?: string): Promise<any> => {
  return post<any>(`/api/orders/${orderId}/approve/`, { notes }, token);
};

export const rejectOrder = async (orderId: number, token: string, reason: string, notes?: string): Promise<any> => {
  return post<any>(`/api/orders/${orderId}/reject/`, { reason, notes }, token);
};

export const cancelOrder = async (orderId: number, token: string): Promise<any> => {
  return post<any>(`/api/orders/${orderId}/cancel/`, {}, token);
};

export const confirmDelivery = async (orderId: number, token: string): Promise<any> => {
  return post<any>(`/api/orders/${orderId}/confirm_delivery/`, {}, token);
};