import { useState, useRef, useEffect } from 'react'
import { apiClient } from '@/lib/apiClient'
import toast from 'react-hot-toast'

interface CatalogIngredient {
    id: string
    name: string
    category: string | null
}

interface IngredientAutocompleteProps {
    value: string
    catalogIngredientId: string | undefined
    onChange: (updates: { customName?: string; catalogIngredientId?: string, fallbackName?: string }) => void
    placeholder?: string
}

export function IngredientAutocomplete({ value, catalogIngredientId, onChange, placeholder }: IngredientAutocompleteProps) {
    const [query, setQuery] = useState(value)
    const [suggestions, setSuggestions] = useState<CatalogIngredient[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<number | null>(null)

    // Sync internal search query if parent changes it
    useEffect(() => {
        setQuery(value)
    }, [value])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (text: string) => {
        setQuery(text)

        // Breaking the catalog link when user types
        if (catalogIngredientId) {
            onChange({ catalogIngredientId: undefined, fallbackName: text })
        } else {
            onChange({ fallbackName: text })
        }

        if (!text.trim()) {
            setSuggestions([])
            setIsOpen(false)
            return
        }

        if (debounceRef.current) window.clearTimeout(debounceRef.current)

        debounceRef.current = window.setTimeout(async () => {
            setLoading(true)
            try {
                const results = await apiClient.get<CatalogIngredient[]>(`/api/ingredients/search?q=${encodeURIComponent(text)}`)
                setSuggestions(results)
                setIsOpen(true)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }, 300)
    }

    const selectSuggestion = (ingredient: CatalogIngredient) => {
        setQuery(ingredient.name)
        setSuggestions([])
        setIsOpen(false)
        onChange({ catalogIngredientId: ingredient.id, fallbackName: ingredient.name, customName: undefined })
    }

    const createNewIngredient = async () => {
        const text = query.trim()
        setIsOpen(false)
        if (!text) return

        try {
            const created = await apiClient.post<{ id: string, name: string }>('/api/ingredients', { name: text })
            setQuery(created.name)
            onChange({ catalogIngredientId: created.id, fallbackName: created.name, customName: undefined })
        } catch (e: unknown) {
            if (typeof e === 'object' && e !== null && 'status' in e && (e as { status: number }).status === 409) {
                toast.error('A similar ingredient already exists. Check the suggestions.', { icon: '⚠️' })
                // Force search to show suggestions
                handleInputChange(text)
            } else {
                // Fallback to custom ingredient
                onChange({ catalogIngredientId: undefined, customName: text, fallbackName: text })
            }
        }
    }

    const exactMatch = suggestions.find(s => s.name.toLowerCase() === query.trim().toLowerCase())

    return (
        <div ref={wrapperRef} className="relative flex-1">
            <div className="relative">
                {catalogIngredientId && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2" title="Linked to catalog">
                        <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                )}
                <input
                    placeholder={placeholder}
                    value={query}
                    onFocus={() => { if (query.trim()) setIsOpen(true) }}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={`w-full rounded-xl border border-warm-300 bg-white text-warm-900 ${catalogIngredientId ? 'pl-9' : 'pl-3'} pr-8 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-warm-300 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && query.trim() && (suggestions.length > 0 || !exactMatch) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-warm-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-2 text-sm text-warm-900 hover:bg-warm-50 flex flex-col"
                        >
                            <span className="font-medium flex items-center gap-2">
                                <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                {suggestion.name}
                            </span>
                            {suggestion.category && (
                                <span className="text-xs text-warm-500">{suggestion.category}</span>
                            )}
                        </button>
                    ))}
                    {!exactMatch && (
                        <button
                            type="button"
                            onClick={createNewIngredient}
                            className="w-full text-left px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50 border-t border-warm-100 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create "{query.trim()}"
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
