import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, Unit } from '@/types'
import { clampQuantity, roundQuantity } from '@/lib/quantityUtils'

function computeLineTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100
}

interface CartState {
  items: CartItem[]
  subtotal: number
}

interface CartActions {
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

function computeSubtotal(items: CartItem[]): number {
  return Math.round(items.reduce((acc, item) => acc + item.lineTotal, 0) * 100) / 100
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,

      addItem: (product, quantity) => {
        const { items } = get()
        const clamped = clampQuantity(quantity, product.unit as Unit)
        const existing = items.find((i) => i.productId === product.id)

        let newItems: CartItem[]
        if (existing) {
          const newQty = clampQuantity(existing.quantity + clamped, product.unit as Unit)
          newItems = items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: newQty, lineTotal: computeLineTotal(i.unitPrice, newQty) }
              : i
          )
        } else {
          const newItem: CartItem = {
            productId: product.id,
            productName: product.name,
            quantity: clamped,
            unit: product.unit,
            unitPrice: product.pricePerUnit,
            lineTotal: computeLineTotal(product.pricePerUnit, clamped),
          }
          newItems = [...items, newItem]
        }
        set({ items: newItems, subtotal: computeSubtotal(newItems) })
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((i) => i.productId !== productId)
        set({ items: newItems, subtotal: computeSubtotal(newItems) })
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get()
        const item = items.find((i) => i.productId === productId)
        if (!item) return
        const qty = clampQuantity(quantity, item.unit as Unit)
        const rounded = roundQuantity(qty, item.unit as Unit)
        const newItems = items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: rounded, lineTotal: computeLineTotal(i.unitPrice, rounded) }
            : i
        )
        set({ items: newItems, subtotal: computeSubtotal(newItems) })
      },

      clearCart: () => set({ items: [], subtotal: 0 }),
    }),
    {
      name: 'munchies-cart',
    }
  )
)
