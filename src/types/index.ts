// types/index.ts

// Types de base
export type UserRole = 'admin' | 'farmer' | 'client' | 'expert';
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'canceled' | 'delivered';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Dimanche, 1: Lundi, etc.

// Interface Utilisateur
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  profile_picture?: string | null;
  farm_name?: string;
  location?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  localisation?: string;
  is_active?: boolean;
  phone_number?: string;
  is_online?: boolean;
}

// Interface Catégorie
export interface Category {
  id: number;
  name: string;
}

// Interface Produit
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string; // Ou Category si vous préférez une relation d'objet
  seller: User;
  available_quantity: number;
  image: string;
  is_approved: boolean;
  created_at: string;
  unit?: string;
  harvest_date?: string;
  organic?: boolean;
}

// Données de formulaire pour produit
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

// Planning de livraison
export interface DeliverySchedule {
  id: number;
  day_of_week: DayOfWeek;
  start_time: string; // Format "HH:MM"
  end_time: string;   // Format "HH:MM"
  location: string;
  is_active: boolean;
  farmer: number | User;
  delivery_date?: string; 
}

// Données pour création de commande
export interface CreateOrderData {
  quantity: number;
  client_notes?: string;
  delivery_schedule_id: number;
}

// Commande
export interface Order {
  id: number;
  product: Product;
  quantity: number;
  status: OrderStatus;
  created_at: string;
  client: User;
  farmer: User;
  delivery_schedule: DeliverySchedule | null;
  rejection_reason?: string;
  status_history?: OrderStatusUpdate[];
  delivery_confirmation?: DeliveryConfirmation;
}

// Mise à jour de statut de commande
export interface OrderStatusUpdate {
  id: number;
  order: number | Order;
  previous_status: OrderStatus;
  new_status: OrderStatus;
  changed_by: User;
  notes: string;
  created_at: string;
}

// Confirmation de livraison
export interface DeliveryConfirmation {
  id: number;
  order: number | Order;
  confirmed_by_client: boolean;
  confirmed_by_farmer: boolean;
  client_confirmation_date?: string;
  farmer_confirmation_date?: string;
}

// Données d'authentification
export interface AuthTokens {
  access: string;
  refresh: string;
}

// Données de connexion
export interface LoginCredentials {
  username: string;
  password: string;
}

// Données d'inscription
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  farm_name?: string;
  location?: string;
}

// Données de mise à jour de profil
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  farm_name?: string;
  profile_picture?: File | null;
}

// Interface pour les notifications
export interface Notification {
  id: number;
  user: number | User;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

// Interface pour les messages
export interface Message {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  read: boolean;
  created_at: string;
}

// Interface pour les avis
export interface Review {
  id: number;
  product: Product;
  reviewer: User;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

// Interface pour les fermes
export interface Farm {
  id: number;
  name: string;
  owner: User;
  description: string;
  location: string;
  image: string;
  created_at: string;
}

// Interface pour les événements
export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  organizer: User | number;
  image: string;
  created_at: string;
}

// Interface pour les transactions
export interface Transaction {
  id: number;
  order: Order;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_date: string;
  created_at: string;
}

// Interface pour les paniers
export interface CartItem {
  product: Product;
  quantity: number;
  delivery_schedule?: DeliverySchedule;
}

// Interface pour les statistiques
export interface Stats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  popular_products: Product[];
}

// Interface pour les paramètres
export interface Settings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  currency: string;
}

// Interface pour le store d'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  fetchUser: () => Promise<void>;
  initializeAuth: () => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
}

// Interface pour le store de contenu
export interface ContentStore {
  shouldRefresh: boolean;
  contents: any[];
  setShouldRefresh: (value: boolean) => void;
  addContent: (content: any) => void;
  resetContents: () => void;
}

// Interface pour le store de panier
export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Interface pour les paramètres de filtrage des produits
export interface ProductFilterParams {
  category?: string;
  farmer?: number;
  min_price?: number;
  max_price?: number;
  organic?: boolean;
  search?: string;
  ordering?: 'name' | 'price' | '-price' | 'created_at';
}

// Interface pour les paramètres de filtrage des commandes
export interface OrderFilterParams {
  status?: OrderStatus;
  product__category?: string;
  farmer?: number;
  client?: number;
  ordering?: 'created_at' | 'delivery_day' | '-created_at';
}

// Interface pour les données de pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface Seller {
  id: number;
  username: string;
}