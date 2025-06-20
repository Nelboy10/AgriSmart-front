// src/types.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string; // Optional, can be null if no image is uploaded
  category: string;
  available_quantity: number;
  is_approved: boolean;
  created_at: string;
  seller: {
    id: number;
    username: string;
    image:string | null; // Optional, can be null if no profile picture
    email: string;
    role: string;
  };
}

export interface DeliverySchedule {
  id: number;
  day_of_week: number; // 0-6 (0=lundi)
  start_time: string;
  end_time: string;
  location: string;
  is_active: boolean;
  farmer: number; // user ID
}

export interface Order {
  id: number;
  client: {
    id: number;
    username: string;
    email: string;
  };
  farmer: {
    id: number;
    username: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'canceled' | 'delivered';
  delivery_schedule: DeliverySchedule;
  delivery_day: string;
  delivery_location: string;
  delivery_time_slot: string;
  rejection_reason?: string;
  created_at: string;
}

export interface OrderStatusUpdate {
  id: number;
  previous_status: string;
  new_status: string;
  changed_by: {
    id: number;
    username: string;
  };
  created_at: string;
  notes?: string;
}

export interface DeliveryConfirmation {
  id: number;
  confirmed_by_client: boolean;
  confirmed_by_farmer: boolean;
  client_confirmation_date?: string;
  farmer_confirmation_date?: string;
}
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'farmer' | 'customer';
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

  available_quantity: number;
  is_approved: boolean;
  created_at: string;
}
