import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { SEOHead } from '@/components/SEOHead'
import toast from 'react-hot-toast'

interface Folder {
  id: string
  name: string
  imageUrl: string | null
  recipeCount: number
  createdAt: string
  updatedAt: string
}

function generateId() {
  return crypto.randomUUID()
}

export function AdminFoldersPage() {
  const { t } = useTranslation()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Folder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null)

  const [formName, setFormName] = useState('')
  const [formImage, setFormImage] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const f = await apiClient.get<Folder[]>('/api/folders')
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
    setFormImage('')
    setShowForm(true)
  }

  function openEdit(folder: Folder) {
    setEditing(folder)
    setFormName(folder.name)
    setFormImage(folder.imageUrl || '')
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) return

    setSaving(true)
    try {
      const now = new Date().toISOString()
      if (editing) {
        await apiClient.put(`/api/folders/${editing.id}`, {
          name: formName.trim(),
          imageUrl: formImage.trim() || undefined,
          updatedAt: now,
        })
        toast.success(t('adminPanel.folderSaved'))
      } else {
        await apiClient.post('/api/folders', {
          id: generateId(),
          name: formName.trim(),
          imageUrl: formImage.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        })
        toast.success(t('adminPanel.folderCreated'))
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
      await apiClient.del(`/api/folders/${deleteTarget.id}`)
      toast.success(t('adminPanel.folderDeleted'))
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <>
      <SEOHead title={t('adminPanel.folders')} />
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-warm-900">{t('adminPanel.folders')}</h1>
          <Button onClick={openCreate}>{t('adminPanel.addFolder')}</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : folders.length === 0 ? (
          <p className="text-warm-500 py-8 text-center">{t('adminPanel.noFolders')}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.folderName')}</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-600">{t('adminPanel.recipeCount')}</th>
                  <th className="text-right px-4 py-3 font-medium text-warm-600">{t('adminPanel.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {folders.map(folder => (
                  <tr key={folder.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-warm-900">{folder.name}</td>
                    <td className="px-4 py-3 text-warm-600">{folder.recipeCount}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(folder)} className="text-primary-600 hover:text-primary-700 font-medium">{t('common.edit')}</button>
                      <button onClick={() => setDeleteTarget(folder)} className="text-red-600 hover:text-red-700 font-medium">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Folder form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-semibold text-warm-900">
                {editing ? t('adminPanel.editFolder') : t('adminPanel.addFolder')}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-warm-400 hover:text-warm-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <Input label={t('adminPanel.folderName')} value={formName} onChange={e => setFormName(e.target.value)} required />
              <Input label={t('adminPanel.imageUrl')} value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="https://..." />
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
        title={t('adminPanel.deleteFolder')}
        description={t('adminPanel.deleteFolderConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />
    </>
  )
}
