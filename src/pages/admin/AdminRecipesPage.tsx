import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { SEOHead } from '@/components/SEOHead'
import toast from 'react-hot-toast'

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
}

interface Recipe {
  id: string
  name: string
  imagePath: string | null
  pricePerKg: number
  folderId: string | null
  ingredients: Ingredient[]
  createdAt: string
  updatedAt: string
}

interface Folder {
  id: string
  name: string
}

function generateId() {
  return crypto.randomUUID()
}

export function AdminRecipesPage() {
  const { t, i18n } = useTranslation()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Recipe | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)
  const [search, setSearch] = useState('')

  const [formName, setFormName] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formFolder, setFormFolder] = useState('')
  const [formIngredients, setFormIngredients] = useState<Ingredient[]>([])
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [r, f] = await Promise.all([
        apiClient.get<Recipe[]>('/api/recipes'),
        apiClient.get<Folder[]>('/api/folders'),
      ])
      setRecipes(r)
      setFolders(f)
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditing(null)
    setFormName('')
    setFormPrice('')
    setFormImage('')
    setFormFolder('')
    setFormIngredients([{ id: generateId(), name: '', quantity: 0, unit: 'g' }])
    setShowForm(true)
  }

  function openEdit(recipe: Recipe) {
    setEditing(recipe)
    setFormName(recipe.name)
    setFormPrice(String(recipe.pricePerKg))
    setFormImage(recipe.imagePath || '')
    setFormFolder(recipe.folderId || '')
    setFormIngredients(recipe.ingredients.length > 0
      ? recipe.ingredients.map(i => ({ ...i }))
      : [{ id: generateId(), name: '', quantity: 0, unit: 'g' }]
    )
    setShowForm(true)
  }

  function addIngredient() {
    setFormIngredients(prev => [...prev, { id: generateId(), name: '', quantity: 0, unit: 'g' }])
  }

  function removeIngredient(id: string) {
    setFormIngredients(prev => prev.filter(i => i.id !== id))
  }

  function updateIngredient(id: string, field: keyof Ingredient, value: string | number) {
    setFormIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formPrice) return

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const ingredients = formIngredients.filter(i => i.name.trim())
      const payload = {
        name: formName.trim(),
        imagePath: formImage.trim() || undefined,
        pricePerKg: parseFloat(formPrice),
        folderId: formFolder || undefined,
        ingredients: ingredients.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit })),
        updatedAt: now,
      }

      if (editing) {
        await apiClient.put(`/api/recipes/${editing.id}`, payload)
        toast.success(t('adminPanel.recipeSaved'))
      } else {
        await apiClient.post('/api/recipes', { ...payload, id: generateId(), createdAt: now })
        toast.success(t('adminPanel.recipeCreated'))
      }

      setShowForm(false)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await apiClient.del(`/api/recipes/${deleteTarget.id}`)
      toast.success(t('admin.deleteSuccess'))
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <SEOHead title={t('adminPanel.recipes')} />
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-warm-900">{t('adminPanel.recipes')}</h1>
          <Button onClick={openCreate}>{t('adminPanel.addRecipe')}</Button>
        </div>

        <Input
          placeholder={t('menu.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 max-w-xs"
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-warm-500 py-8 text-center">{t('menu.noResults')}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.recipeName')}</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.price')}</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.folder')}</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.ingredientCount')}</th>
                  <th className="text-right px-4 py-3 font-medium text-warm-600">{t('adminPanel.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {filtered.map(recipe => (
                  <tr key={recipe.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-warm-900">{recipe.name}</td>
                    <td className="px-4 py-3 text-warm-700">{formatPrice(recipe.pricePerKg, i18n.language)}/kg</td>
                    <td className="px-4 py-3 text-warm-600">{folders.find(f => f.id === recipe.folderId)?.name || '—'}</td>
                    <td className="px-4 py-3 text-warm-600">{recipe.ingredients.length}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(recipe)} className="text-primary-600 hover:text-primary-700 font-medium">{t('common.edit')}</button>
                      <button onClick={() => setDeleteTarget(recipe)} className="text-red-600 hover:text-red-700 font-medium">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recipe form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 mb-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-semibold text-warm-900">
                {editing ? t('adminPanel.editRecipe') : t('adminPanel.addRecipe')}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-warm-400 hover:text-warm-600">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <Input label={t('adminPanel.recipeName')} value={formName} onChange={e => setFormName(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('adminPanel.pricePerKg')} type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} required />
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">{t('adminPanel.folder')}</label>
                  <select
                    value={formFolder}
                    onChange={e => setFormFolder(e.target.value)}
                    className="w-full rounded-xl border border-warm-300 bg-white text-warm-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">—</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <Input label={t('adminPanel.imageUrl')} value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="https://..." />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-warm-700">{t('adminPanel.ingredients')}</label>
                  <button type="button" onClick={addIngredient} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    + {t('adminPanel.addIngredient')}
                  </button>
                </div>
                <div className="space-y-2">
                  {formIngredients.map(ing => (
                    <div key={ing.id} className="flex gap-2 items-center">
                      <input
                        placeholder={t('adminPanel.ingredientName')}
                        value={ing.name}
                        onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                        className="flex-1 rounded-xl border border-warm-300 bg-white text-warm-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="number"
                        placeholder={t('adminPanel.qty')}
                        value={ing.quantity || ''}
                        onChange={e => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 rounded-xl border border-warm-300 bg-white text-warm-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <select
                        value={ing.unit}
                        onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
                        className="w-16 rounded-xl border border-warm-300 bg-white text-warm-900 px-2 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="mL">mL</option>
                        <option value="L">L</option>
                      </select>
                      <button type="button" onClick={() => removeIngredient(ing.id)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-warm-100">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              <Button type="submit" loading={saving}>{t('common.save')}</Button>
            </div>
          </form>
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('admin.deleteProduct')}
        description={t('admin.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />
    </>
  )
}
