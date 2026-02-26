export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type DeliveryType = 'delivery' | 'pickup'

export type PaymentMethod = 'cash'

export interface DeliveryInfo {
  type: DeliveryType
  address: string | null
  date: string
  time: string
  note: string
  scheduledAt?: string
}

export interface OrderSummary {
  subtotal: number
  deliveryFee: number
  total: number
  currency: 'RSD'
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  lineTotal: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface OrderPayload {
  customer: Customer
  delivery: DeliveryInfo
  items: OrderItem[]
  summary: OrderSummary
  paymentMethod: PaymentMethod
}

export interface Order extends OrderPayload {
  id: string
  orderNumber: string
  status: OrderStatus
  createdAt: string
  note?: string
}

export function canCancelOrder(status: OrderStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled'
}

export function userToCustomer(user: import('./user').User): Customer {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
  }
}
