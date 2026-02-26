import type { Order, OrderPayload, OrderStatus } from '@/types'
import { delay } from '@/lib/delay'
import { generateOrderNumber, generateUUID } from '@/lib/orderUtils'

// In-memory order store (mock)
const orders: Order[] = []

// Simulate status progression for demo purposes
const statusCycle: OrderStatus[] = ['preparing', 'ready', 'out_for_delivery', 'delivered']

export const orderService = {
  async createOrder(payload: OrderPayload): Promise<Order> {
    await delay(600)

    // Simulate occasional failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Greška pri slanju narudžbine. Molimo pokušajte ponovo.')
    }

    const order: Order = {
      ...payload,
      id: generateUUID(),
      orderNumber: generateOrderNumber(),
      status: 'preparing',
      createdAt: new Date().toISOString(),
    }
    orders.push(order)
    return { ...order }
  },

  async getOrderById(id: string): Promise<Order> {
    await delay(200)
    const found = orders.find((o) => o.id === id)
    if (!found) throw new Error(`Narudžbina sa ID "${id}" nije pronađena.`)
    return { ...found }
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    await delay(200)
    const found = orders.find((o) => o.orderNumber === orderNumber)
    if (!found) throw new Error(`Narudžbina "${orderNumber}" nije pronađena.`)
    return { ...found }
  },

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    await delay(300)
    return orders.filter((o) => o.customer.id === userId).map((o) => ({ ...o }))
  },

  async getOrderStatus(id: string): Promise<OrderStatus> {
    await delay(150)
    const found = orders.find((o) => o.id === id)
    if (!found) throw new Error(`Narudžbina sa ID "${id}" nije pronađena.`)
    return found.status
  },

  async cancelOrder(id: string): Promise<Order> {
    await delay(400)
    const found = orders.find((o) => o.id === id)
    if (!found) throw new Error(`Narudžbina sa ID "${id}" nije pronađena.`)
    if (found.status === 'delivered' || found.status === 'cancelled') {
      throw new Error('Ova narudžbina ne može biti otkazana.')
    }
    found.status = 'cancelled'
    return { ...found }
  },

  // Helper for demo: advance order to next status
  async advanceOrderStatus(id: string): Promise<Order> {
    await delay(300)
    const found = orders.find((o) => o.id === id)
    if (!found) throw new Error(`Narudžbina sa ID "${id}" nije pronađena.`)
    const currentIndex = statusCycle.indexOf(found.status)
    if (currentIndex !== -1 && currentIndex < statusCycle.length - 1) {
      found.status = statusCycle[currentIndex + 1]
    }
    return { ...found }
  },
}
