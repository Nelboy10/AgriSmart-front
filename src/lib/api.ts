// lib/api.ts
import { 
  Product, 
  CreateOrderData, 
  Order as OrderType, 
  OrderStatusUpdate, 
  DeliveryConfirmation, 
  ProductFormData,
  User
} from '@/types';

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
    const message = errorData?.detail || errorData?.message || errorData?.error || 'Erreur serveur';
    throw new Error(message);
  }
  return res.json();
};

// Helpers génériques
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

const postForm = async <T>(path: string, formData: FormData, token: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: formData,
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

const del = async <T>(path: string, token: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResponse(res);
};

// API Produits
export const fetchProducts = async (params: Record<string, any> = {}, token?: string): Promise<Product[]> => {
  const cleanParams = sanitizeParams(params);
  const query = new URLSearchParams(cleanParams).toString();
  return get<Product[]>(`/api/products/?${query}`, token);
};

export const fetchProduct = async (id: string, token?: string): Promise<Product> => {
  return get<Product>(`/api/products/${id}/`, token);
};

export const createProduct = async (data: FormData, token: string): Promise<Product> => {
  return postForm<Product>('/api/products/', data, token);
};

export const updateProduct = async (id: number, data: FormData, token: string): Promise<Product> => {
  return putForm<Product>(`/api/products/${id}/`, data, token);
};

export const patchProduct = async (id: number, data: Partial<Product>, token: string): Promise<Product> => {
  return patch<Product>(`/api/products/${id}/`, data, token);
};

export const deleteProduct = async (id: number, token: string): Promise<void> => {
  return del<void>(`/api/products/${id}/`, token);
};

// API Commandes - Utilisation de "OrderType" pour éviter les conflits de noms
export const fetchOrders = async (token?: string): Promise<OrderType[]> => {
  return get<OrderType[]>('/api/orders/', token);
};

export const fetchOrderDetail = async (id: string, token?: string): Promise<OrderType> => {
  return get<OrderType>(`/api/orders/${id}/`, token);
};

export const fetchOrderStatusHistory = async (orderId: number, token: string): Promise<OrderStatusUpdate[]> => {
  return get<OrderStatusUpdate[]>(`/api/orders/${orderId}/status_history/`, token);
};

export const fetchDeliveryConfirmation = async (orderId: number, token: string): Promise<DeliveryConfirmation> => {
  return get<DeliveryConfirmation>(`/api/orders/${orderId}/delivery_confirmation/`, token);
};

export const placeOrder = async (
  productId: number,
  data: CreateOrderData,
  token: string
): Promise<OrderType> => {
  return post<OrderType>(`/api/products/${productId}/place_order/`, data, token);
};

export const approveOrder = async (orderId: number, token: string, notes?: string): Promise<OrderType> => {
  return post<OrderType>(`/api/orders/${orderId}/approve/`, { notes }, token);
};

export const rejectOrder = async (orderId: number, token: string, reason: string, notes?: string): Promise<OrderType> => {
  return post<OrderType>(`/api/orders/${orderId}/reject/`, { reason, notes }, token);
};

export const cancelOrder = async (orderId: number, token: string): Promise<OrderType> => {
  return post<OrderType>(`/api/orders/${orderId}/cancel/`, {}, token);
};

export const confirmDelivery = async (orderId: number, token: string): Promise<OrderType> => {
  return post<OrderType>(`/api/orders/${orderId}/confirm_delivery/`, {}, token);
};

// API Livraisons
export const fetchDeliverySchedules = async (farmerId: number, token?: string): Promise<any[]> => {
  return get<any[]>(`/api/delivery-schedules/?farmer=${farmerId}`, token);
};

// API Utilisateurs
export const fetchCurrentUser = async (token: string): Promise<User> => {
  return get<User>('/api/auth/users/me/', token);
};

export const updateUserProfile = async (data: Partial<User>, token: string): Promise<User> => {
  return patch<User>('/api/auth/users/me/', data, token);
};

export const updateUserProfilePicture = async (formData: FormData, token: string): Promise<User> => {
  const res = await fetch(`${API_URL}/api/auth/users/me/`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: formData,
  });
  return handleResponse(res);
};

// API Authentification
export const login = async (credentials: { username: string; password: string }) => {
  const res = await fetch(`${API_URL}/api/auth/jwt/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Identifiants incorrects');
  }
  
  return res.json();
};

export const register = async (data: { 
  username: string; 
  email: string; 
  password: string;
  role: string;
  farm_name?: string;
  location?: string;
}) => {
  const res = await fetch(`${API_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    const errorMessage = Object.entries(errorData)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');
    throw new Error(errorMessage || "Échec de l'inscription");
  }
  
  return res.json();
};



// API Autres ressources
export const fetchCategories = async (token?: string): Promise<any[]> => {
  return get<any[]>('/api/categories/', token);
};

export const fetchFarmers = async (token?: string): Promise<User[]> => {
  return get<User[]>('/api/users/?role=farmer', token);
};