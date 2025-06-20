// types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'farmer' | 'client'|'expert';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: User;
  available_quantity: number;
  image: string;
  is_approved: boolean;
  created_at: string;
  
}

export interface DeliverySchedule {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  is_active: boolean;
}

export interface CreateOrderData {
  quantity: number;
   client_notes?: string; 
  delivery_schedule_id: number;
}
// Ajoutez ces interfaces à votre fichier types/index.ts
export interface Category {
  id: number;
  name: string;
}

export interface Seller {
  id: number;
  username: string;
}
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'farmer' | 'client' | 'expert';
  profile_picture?: string | null;
  farm_name?: string;
  location?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: User;
  available_quantity: number;
  image: string;
  is_approved: boolean;
  created_at: string;
}
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  available_quantity: number;
  image: File | string | null;
  unit?: string;
  harvest_date?: string;
  organic?: boolean;
}
 export interface Order {
  id: number;
  product: Product;
  quantity: number;
  status: string;
  created_at: string;
  client: User
  farmer: User
  delivery_schedule: string | null
  
}
export interface OrderStatusUpdate {
  id: number
  previous_status: string
  new_status: string
  changed_by: User
  notes: string
  created_at: string
}

export interface DeliveryConfirmation {
  id: number
  order: number
  confirmed_by_client: boolean
  confirmed_by_farmer: boolean
  client_confirmation_date?: string
  farmer_confirmation_date?: string
}
