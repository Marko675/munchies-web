import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { SEOHead } from '@/components/SEOHead'
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete'
import toast from 'react-hot-toast'

interface CatalogIngredient {
    id: string
    name: string
    category: string | null
    tags: string[]
    createdAt: string
    updatedAt: string
}

export function AdminIngredientsPage() {
    const { t } = useTranslation()
    const [ingredients, setIngredients] = useState<CatalogIngredient[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Edit modal state
    const [editing, setEditing] = useState<CatalogIngredient | null>(null)
    const [formName, setFormName] = useState('')
    const [formCategory, setFormCategory] = useState('')
    const [savingConfig, setSavingConfig] = useState(false)

    // Merge modal state
    const [merging, setMerging] = useState<CatalogIngredient | null>(null)
    const [targetId, setTargetId] = useState<string | undefined>('')
    const [isMerging, setIsMerging] = useState(false)

    async function loadData() {
        setLoading(true)
        try {
            const results = await apiClient.get<CatalogIngredient[]>('/api/ingredients?limit=1000')
            setIngredients(results)
        } catch {
            toast.error(t('errors.generic'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Edit logic
    function openEdit(item: CatalogIngredient) {
        setEditing(item)
        setFormName(item.name)
        setFormCategory(item.category || '')
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editing || !formName.trim()) return

        setSavingConfig(true)
        try {
            await apiClient.put(`/api/ingredients/${editing.id}`, { name: formName.trim(), category: formCategory.trim() || undefined })
            toast.success(t('common.saved'))
            setEditing(null)
            await loadData()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('errors.generic'))
        } finally {
            setSavingConfig(false)
        }
    }

    // Merge logic
    function openMerge(item: CatalogIngredient) {
        setMerging(item)
        setTargetId(undefined)
    }

    async function handleMerge() {
        if (!merging || !targetId) return

        setIsMerging(true)
        try {
            const res = await apiClient.post<{ success: boolean, merged: { from: string, into: string } }>('/api/ingredients/merge', {
                sourceId: merging.id,
                targetId: targetId
            })
            toast.success(`Merged "${res.merged.from}" into "${res.merged.into}"`)
            setMerging(null)
            await loadData()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('errors.generic'))
        } finally {
            setIsMerging(false)
        }
    }

    const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <>
            <SEOHead title={t('adminPanel.ingredients')} />
            <div className="p-6 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-warm-900">{t('adminPanel.ingredients')} Catalog</h1>
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
                                    <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.ingredientName')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-warm-600">Category</th>
                                    <th className="text-left px-4 py-3 font-medium text-warm-600">ID</th>
                                    <th className="text-right px-4 py-3 font-medium text-warm-600">{t('adminPanel.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warm-50">
                                {filtered.map(ing => (
                                    <tr key={ing.id} className="hover:bg-warm-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-warm-900">{ing.name}</td>
                                        <td className="px-4 py-3 text-warm-600">{ing.category || '—'}</td>
                                        <td className="px-4 py-3 text-warm-400 font-mono text-xs">{ing.id.split('-')[0]}</td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button onClick={() => openEdit(ing)} className="text-primary-600 hover:text-primary-700 font-medium">{t('common.edit')}</button>
                                            <button onClick={() => openMerge(ing)} className="text-orange-600 hover:text-orange-700 font-medium">Merge</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
                            <h2 className="text-lg font-semibold text-warm-900">Edit Ingredient</h2>
                            <button type="button" onClick={() => setEditing(null)} className="text-warm-400 hover:text-warm-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label={t('adminPanel.ingredientName')} value={formName} onChange={e => setFormName(e.target.value)} required />
                            <Input label="Category" placeholder="e.g. Dairy, Vegetable..." value={formCategory} onChange={e => setFormCategory(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-warm-100">
                            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>{t('common.cancel')}</Button>
                            <Button type="submit" loading={savingConfig}>{t('common.save')}</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Merge Modal */}
            <Modal
                isOpen={!!merging}
                onClose={() => setMerging(null)}
                onConfirm={handleMerge}
                title={`Merge "${merging?.name}"`}
                description={`Select the ingredient that "${merging?.name}" should be merged into. All recipes currently using "${merging?.name}" will be automatically updated to use the target ingredient, and "${merging?.name}" will be deleted from the catalog. THIS CANNOT BE UNDONE.`}
                confirmLabel="Confirm Merge"
                cancelLabel={t('common.cancel')}
                variant="danger"
                confirmDisabled={!targetId || isMerging}
            >
                <div className="mt-4 pt-4 border-t border-red-100">
                    <label className="block text-sm font-medium text-warm-900 mb-2">Target Ingredient</label>
                    <div className="h-12 w-full">
                        <IngredientAutocomplete
                            value=""
                            catalogIngredientId={targetId}
                            onChange={({ catalogIngredientId }) => setTargetId(catalogIngredientId)}
                            placeholder="Search for target ingredient..."
                        />
                    </div>
                </div>
            </Modal>
        </>
    )
}
