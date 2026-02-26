import { create } from 'zustand'
import type { Order, OrderPayload } from '@/types'
import { orderService } from '@/services/orderService'

interface OrdersState {
  currentOrder: Order | null
  orderHistory: Order[]
  loading: boolean
  error: string | null
}

interface OrdersActions {
  createOrder: (payload: OrderPayload) => Promise<Order>
  fetchOrder: (id: string) => Promise<void>
  fetchOrderHistory: (userId: string) => Promise<void>
  cancelOrder: (id: string) => Promise<void>
  clearCurrentOrder: () => void
  clearError: () => void
}

export const useOrdersStore = create<OrdersState & OrdersActions>()((set) => ({
  currentOrder: null,
  orderHistory: [],
  loading: false,
  error: null,

  createOrder: async (payload) => {
    set({ loading: true, error: null })
    try {
      const order = await orderService.createOrder(payload)
      set({ currentOrder: order, loading: false })
      return order
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri kreiranje narudžbine'
      set({ loading: false, error: message })
      throw err
    }
  },

  fetchOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      const order = await orderService.getOrderById(id)
      set({ currentOrder: order, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri učitavanju narudžbine'
      set({ loading: false, error: message })
    }
  },

  fetchOrderHistory: async (userId) => {
    set({ loading: true, error: null })
    try {
      const orders = await orderService.getOrdersByUserId(userId)
      set({ orderHistory: orders, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri učitavanju istorije'
      set({ loading: false, error: message })
    }
  },

  cancelOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      const cancelled = await orderService.cancelOrder(id)
      set((state) => ({
        currentOrder: state.currentOrder?.id === id ? cancelled : state.currentOrder,
        orderHistory: state.orderHistory.map((o) => (o.id === id ? cancelled : o)),
        loading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri otkazivanju'
      set({ loading: false, error: message })
      throw err
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  clearError: () => set({ error: null }),
}))
