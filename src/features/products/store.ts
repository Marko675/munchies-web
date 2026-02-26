import { create } from 'zustand'
import type { Product, Category } from '@/types'
import { productService } from '@/services/productService'

export type SortOption = 'price_asc' | 'price_desc' | 'name_asc'

interface ProductsState {
  products: Product[]
  categories: Category[]
  search: string
  categoryId: string | null
  sort: SortOption
  loading: boolean
  error: string | null
  filteredProducts: Product[]
}

interface ProductsActions {
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  setSearch: (search: string) => void
  setCategoryId: (id: string | null) => void
  setSort: (sort: SortOption) => void
  deleteProduct: (id: string) => Promise<void>
}

function applyFilters(
  products: Product[],
  search: string,
  categoryId: string | null,
  sort: SortOption
): Product[] {
  let result = [...products]

  if (search.trim()) {
    const lower = search.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(lower))
  }

  if (categoryId) {
    result = result.filter((p) => p.categoryIds.includes(categoryId))
  }

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.pricePerUnit - b.pricePerUnit)
      break
    case 'price_desc':
      result.sort((a, b) => b.pricePerUnit - a.pricePerUnit)
      break
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name, 'sr'))
      break
  }

  return result
}

export const useProductsStore = create<ProductsState & ProductsActions>()((set, get) => ({
  products: [],
  categories: [],
  search: '',
  categoryId: null,
  sort: 'name_asc',
  loading: false,
  error: null,
  filteredProducts: [],

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const products = await productService.getProducts()
      const { search, categoryId, sort } = get()
      set({
        products,
        filteredProducts: applyFilters(products, search, categoryId, sort),
        loading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri učitavanju proizvoda'
      set({ loading: false, error: message })
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories()
      set({ categories })
    } catch {
      // categories error is non-critical
    }
  },

  setSearch: (search) => {
    const { products, categoryId, sort } = get()
    set({ search, filteredProducts: applyFilters(products, search, categoryId, sort) })
  },

  setCategoryId: (id) => {
    const { products, search, sort } = get()
    set({ categoryId: id, filteredProducts: applyFilters(products, search, id, sort) })
  },

  setSort: (sort) => {
    const { products, search, categoryId } = get()
    set({ sort, filteredProducts: applyFilters(products, search, categoryId, sort) })
  },

  deleteProduct: async (id) => {
    await productService.deleteProduct(id)
    const newProducts = get().products.filter((p) => p.id !== id)
    const { search, categoryId, sort } = get()
    set({
      products: newProducts,
      filteredProducts: applyFilters(newProducts, search, categoryId, sort),
    })
  },
}))
