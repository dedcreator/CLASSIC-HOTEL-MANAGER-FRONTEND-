// frontend/lib/api/types.ts
export interface RoomAccessCode {
  id: string;
  code: string;
  code_type: 'checkin' | 'emergency' | 'cleaning';
  code_type_display?: string;
  room: string;
  room_number: string;
  booking?: string | null;
  status: 'pending_approval' | 'active' | 'expired' | 'used' | 'revoked';
  status_display?: string;
  is_valid: boolean;
  created_by?: string | null;
  created_by_name?: string | null;
  created_by_role?: string | null;
  approved_by?: string | null;
  approved_by_name?: string | null;
  approved_by_role?: string | null;
  approved_at?: string | null;
  valid_from: string;
  valid_until: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  actor?: string | null;
  actor_username: string;
  actor_role: string;
  actor_display?: string;
  action: string;
  action_display?: string;
  room?: string | null;
  room_number?: string;
  booking?: string | null;
  booking_reference?: string;
  access_code?: string;
  details: string;
  ip_address?: string | null;
}

// Room Types
export interface Room {
  id: string;
  room_number: string;
  room_type: 'standard' | 'deluxe' | 'suite' | 'executive' | 'presidential';
  room_type_display?: string;
  base_price: number;
  barcode?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  status_display?: string;
  capacity?: number;
  description?: string;
  name?: string;
  size?: number;
  amenities?: string[];
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
  active_access_code?: RoomAccessCode | null;
  pending_cleaning_request?: RoomAccessCode | null;
}

// Product/Inventory Types
export interface Product {
  id: string;
  name: string;
  category: 'beer' | 'wine' | 'spirit' | 'soft_drink' | 'juice' | 'cocktail' | 'food' | 'other';
  default_price: number;
  unit: 'bottle' | 'pint' | 'glass' | 'can' | 'shot' | 'plate' | 'unit';
  barcode?: string | null;
  min_stock_level: number;
  is_active: boolean;
  total_stock: number;
  is_low_stock: boolean;
  location?: string;
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  product: string;
  product_name: string;
  quantity: number;
  cost_price: number | null;
  selling_price: number;
  supplier: string;
  batch_number: string;
  date_received: string;
  notes: string;
  received_by_name: string;
}

export interface StockMovement {
  id: string;
  product: string;
  product_name: string;
  batch: string | null;
  quantity: number;
  movement_type: 'sale' | 'restock' | 'adjustment' | 'wastage';
  price_at_movement: number;
  notes: string;
  created_at: string;
  created_by_name: string;
}

export interface StockAlert {
  id: string;
  product: string;
  product_name: string;
  threshold: number;
  current_stock: number;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

// Sales Types
export interface SaleItem {
  id: string;
  product: Product;
  product_details?: Product;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  transaction_number: string;
  guest_name?: string;
  room?: string;
  room_number?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  amount_paid: number;
  change: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'room_charge';
  payment_status: string;
  notes?: string;
  staff_name?: string;
  created_at: string;
}

// Cart Types - Only define once
export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface CreateSaleData {
  guest_name?: string;
  room?: string | null;
  payment_method: 'cash' | 'card' | 'room_charge';
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

// Staff Types
export interface Staff {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'BAR_STAFF' | 'HOUSEKEEPING' | 'CEO';
  phone?: string;
  is_active: boolean;
  profile_picture?: string;
  created_at: string;
}

export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  period_days: number;
  sales: {
    count: number;
    total: number;
    average: number;
  };
  bookings: {
    count: number;
  };
  check_ins: number;
}

export interface StaffSummary {
  total: number;
  active: number;
  inactive: number;
  roles: Array<{ role: string; count: number }>;
  recent: Staff[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  codename: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  user_name: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

// Customer Types
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  is_vip: boolean;
  notes?: string;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  created_at: string;
  full_name?: string;
}

export interface SavedCart {
  id: string;
  customer: Customer;
  customer_details?: Customer;
  cart_data: any[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  is_completed: boolean;
  created_at: string;
}

// Guest & Booking Types
export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone: string;
  id_number?: string;
  address?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  guest: Guest;
  guest_details?: Guest;
  guest_name?: string;
  room: Room;
  room_details?: Room;
  room_number?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_nights: number;
  total_amount: number;
  amount_paid: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: 'cash' | 'card' | 'transfer';
  special_requests?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  created_at: string;
  updated_at: string;
  active_access_code?: RoomAccessCode | null;
}

export interface TodayBookings {
  arrivals: Booking[];
  departures: Booking[];
  arrivals_count: number;
  departures_count: number;
}

export interface BookingStats {
  total_bookings: number;
  active_guests: number;
  today_arrivals: number;
  today_departures: number;
}

// Expense Types
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  expense_count?: number;
  total_amount?: number;
  created_at: string;
}

export interface Expense {
  id: string;
  expense_number: string;
  category: string;
  category_name?: string;
  description: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'pos';
  expense_date: string;
  receipt_number?: string;
  notes?: string;
  is_recurring: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
  updated_by?: string;
  updated_by_name?: string;
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface ExpenseSummary {
  total_expenses: number;
  expense_count: number;
  this_month_total?: number;
  by_category: Array<{
    category: string;
    category_name: string;
    total: number;
    count: number;
  }>;
  by_month: Array<{
    month: string;
    month_name?: string;
    total: number;
    count: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Sales Report Types
export interface TodaySales {
  summary: {
    total_sales: number;
    count: number;
  };
  transactions: Sale[];
}

export interface RevenueReport {
  name?: string;
  month?: string;
  week?: string;
  date?: string;
  revenue: number;
  profit: number;
  expenses: number;
  transactions: number;
}

// In-App Notification Types
export interface InAppNotification {
  id: string;
  role_target?: string | null;
  title: string;
  message: string;
  notification_type: 'room_checkout' | 'website_booking' | 'stock_added' | 'system';
  data: Record<string, any>;
  link?: string;
  is_read: boolean;
  is_read_by_me: boolean;
  created_at: string;
}