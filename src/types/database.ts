export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface ShippingAddress {
  id: string
  user_id: string
  full_name: string
  address_line1: string
  address_line2?: string
  city: string
  county: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  shipping_address_id: string
  shipping_method: string
  shipping_cost: number
  subtotal: number
  tax: number
  total: number
  notes?: string
  tracking_number?: string
  estimated_delivery_date?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  quantity: number
  price: number
  image_url: string
  created_at: string
}

export interface PaymentTransaction {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  payment_method: string
  stripe_payment_intent_id?: string
  stripe_client_secret?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  email: string
  created_at: string
  updated_at: string
} 