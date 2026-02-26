import type { Product, Category } from '@/types'
import { apiClient } from '@/lib/apiClient'

/** Shape returned by GET /api/recipes */
interface BackendRecipe {
  id: string
  name: string
  imagePath: string | null
  pricePerKg: number
  folderId: string | null
  ingredients: {
    id: string
    recipeId: string
    name: string
    quantity: number
    unit: string
  }[]
  createdAt: string
  updatedAt: string
}

/** Shape returned by GET /api/folders */
interface BackendFolder {
  id: string
  name: string
  imageUrl: string | null
  recipeCount: number
  createdAt: string
  updatedAt: string
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80'

function mapRecipeToProduct(recipe: BackendRecipe): Product {
  return {
    id: recipe.id,
    name: recipe.name,
    image: recipe.imagePath || PLACEHOLDER_IMAGE,
    pricePerUnit: recipe.pricePerKg,
    unit: 'kg',
    categoryIds: recipe.folderId ? [recipe.folderId] : [],
    featured: false,
    available: true,
  }
}

function mapFolderToCategory(folder: BackendFolder): Category {
  return {
    id: folder.id,
    name: folder.name,
  }
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const recipes = await apiClient.get<BackendRecipe[]>('/api/public/recipes')
    return recipes.map(mapRecipeToProduct)
  },

  async getProductById(id: string): Promise<Product> {
    const recipe = await apiClient.get<BackendRecipe>(`/api/public/recipes/${id}`)
    return mapRecipeToProduct(recipe)
  },

  async getCategories(): Promise<Category[]> {
    const folders = await apiClient.get<BackendFolder[]>('/api/public/folders')
    return folders.map(mapFolderToCategory)
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const recipes = await apiClient.get<BackendRecipe[]>('/api/public/recipes')
    return recipes.map(mapRecipeToProduct)
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.del(`/api/recipes/${id}`)
  },
}

