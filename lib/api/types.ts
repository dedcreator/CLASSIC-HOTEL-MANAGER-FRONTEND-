// frontend/lib/api/types.ts
// Room Types
export interface Room {
  id: string;
  room_number: string;
  room_type: 'standard' | 'deluxe';
  base_price: number;
  barcode: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  capacity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Product/Inventory Types
export interface Product {
  id: string;
  name: string;
  category: 'beer' | 'wine' | 'spirit' | 'soft_drink' | 'juice' | 'cocktail' | 'food' | 'other';
  default_price: number;
  unit: 'bottle' | 'pint' | 'glass' | 'can' | 'shot' | 'plate' | 'unit';
  barcode: string;
  min_stock_level: number;
  is_active: boolean;
  total_stock: number;
  is_low_stock: boolean;
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


// frontend/lib/api/types.ts - Add these

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

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

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
export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
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

export interface Room {
  id: string;
  room_number: string;
  room_type: 'standard' | 'deluxe';
  base_price: number;
  barcode: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  capacity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// frontend/lib/api/types.ts - Add these

export interface Staff {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'manager' | 'receptionist' | 'bar_staff' | 'housekeeping' | 'ceo';
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

// frontend/lib/api/types.ts - Add these types

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
  by_category: Array<{
    category__name: string;
    category__id: string;
    total: number;
    count: number;
  }>;
  by_month: Array<{
    month: string;
    total: number;
    count: number;
  }>;
}