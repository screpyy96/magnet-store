// src/types/database.ts

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded'
  | 'failed'

export interface Address {
  id: string
  user_id: string
  full_name: string
  address_line1: string
  address_line2: string | null
  city: string
  county: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  stripe_payment_method_id: string
  card_brand: string
  last4: string
  exp_month: number
  exp_year: number
  is_default: boolean
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  shipping_address_id: string | null
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  total: number
  payment_status: PaymentStatus | null
  payment_intent_id: string | null
  tracking_number: string | null
  created_at: string
  updated_at: string
  shipping_address?: Address
  order_items?: OrderItem[]
  payment_transactions?: PaymentTransaction[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  price_per_unit: number
  quantity: number
  size: string | null
  image_url: string | null
  special_requirements: string | null
  created_at: string
  order?: Order
}

export interface PaymentTransaction {
  id: string
  order_id: string
  user_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  payment_method_id: string | null
  stripe_payment_intent_id: string | null
  error_message: string | null
  created_at: string
  order?: Order
  payment_method?: PaymentMethod
  user?: User
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface User {
  id: string
  email: string
  email_confirmed_at?: string
  phone?: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
  profile?: Profile
  addresses?: Address[]
  payment_methods?: PaymentMethod[]
  orders?: Order[]
  payment_transactions?: PaymentTransaction[]
}

export interface DeletionRequest {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  processed_at: string | null
  processed_by: string | null
  created_at: string
  user?: User
  processed_by_user?: User
}

// Database enums
export const OrderStatuses = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export const PaymentStatuses = {
  PENDING: 'pending',
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  PROCESSING: 'processing',
  REQUIRES_CAPTURE: 'requires_capture',
  CANCELED: 'canceled',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const

// Types for database query results
export interface OrderWithRelations extends Order {
  shipping_address?: Address
  order_items?: OrderItem[]
  payment_transactions?: PaymentTransaction[]
  user?: User
}

export interface UserWithRelations extends User {
  profile?: Profile
  addresses?: Address[]
  payment_methods?: PaymentMethod[]
  orders?: Order[]
}

// Form data types
export interface AddressFormData extends Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}
export interface PaymentMethodFormData extends Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}
export interface OrderCreateData extends Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status' | 'payment_status'> {}

// Database tables type for type-safe table names
export type DatabaseTable = 
  | 'profiles'
  | 'shipping_addresses'
  | 'payment_methods'
  | 'orders'
  | 'order_items'
  | 'payment_transactions'
  | 'deletion_requests'