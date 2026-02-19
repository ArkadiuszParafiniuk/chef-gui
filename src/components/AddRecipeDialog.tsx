import { useState, useEffect, useRef } from 'react'
import type { Recipe, TypeOfDish } from '../types/recipe'
import { createRecipe, updateRecipe, findTags } from '../api/recipeApi'

interface Props {
  recipe?: Recipe
  onClose: () => void
  onSaved: () => void
}

const DISH_TYPES: TypeOfDish[] = ['BREAKFAST', 'DINNER', 'DESSERT', 'DRINK']

const DISH_LABELS: Record<TypeOfDish, string> = {
  BREAKFAST: 'Śniadanie',
  DINNER: 'Obiad',
  DESSERT: 'Deser',
  DRINK: 'Napój',
}

interface IngredientRow {
  ingredient: string
  amount: string
}

export default function AddRecipeDialog({ recipe, onClose, onSaved }: Props) {
  const isEdit = recipe !== undefined

  const [title, setTitle] = useState(recipe?.title ?? '')
  const [typeOfDish, setTypeOfDish] = useState<TypeOfDish | ''>(recipe?.typeOfDish ?? '')
  const [content, setContent] = useState(recipe?.content ?? '')
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [{ ingredient: '', amount: '' }],
  )
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? [])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)
  const tagWrapperRef = useRef<HTMLDivElement>(null)

  // Escape: close suggestions first, then dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTagSuggestions) {
          setShowTagSuggestions(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, showTagSuggestions])

  // Fetch tag suggestions while the dropdown is open
  useEffect(() => {
    if (!showTagSuggestions) return
    const timer = setTimeout(async () => {
      try {
        const results = await findTags(tagInput.trim() || undefined)
        setTagSuggestions(results.filter((t) => !tags.includes(t)))
      } catch {
        setTagSuggestions([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [tagInput, showTagSuggestions, tags])

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (tagWrapperRef.current && !tagWrapperRef.current.contains(e.target as Node)) {
        setShowTagSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { ingredient: '', amount: '' }])
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
    setShowTagSuggestions(false)
  }

  function selectSuggestedTag(tag: string) {
    if (!tags.includes(tag)) setTags((prev) => [...prev, tag])
    setTagInput('')
    setShowTagSuggestions(false)
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const visibleSuggestions = tagSuggestions.filter((t) => !tags.includes(t))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const filteredIngredients = ingredients.filter((i) => i.ingredient.trim())
      const payload: Recipe = {
        uuid: recipe?.uuid ?? crypto.randomUUID(),
        title: title.trim(),
        typeOfDish: typeOfDish || undefined,
        content: content.trim() || undefined,
        ingredients: filteredIngredients.length > 0 ? filteredIngredients : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }
      if (isEdit) {
        await updateRecipe(payload.uuid, payload)
      } else {
        await createRecipe(payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu przepisu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dialog-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-header">
          <h2 className="dialog-title" id="dialog-title">
            {isEdit ? 'Edytuj przepis' : 'Nowy przepis'}
          </h2>
          <button className="dialog-close" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">
              Nazwa przepisu <span className="required">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="np. Spaghetti carbonara"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="label">Typ dania</label>
            <select
              className="input"
              value={typeOfDish}
              onChange={(e) => setTypeOfDish(e.target.value as TypeOfDish | '')}
            >
              <option value="">— wybierz —</option>
              {DISH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {DISH_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Składniki</label>
            <div className="ingredients-list">
              {ingredients.map((row, i) => (
                <div key={i} className="ingredient-row">
                  <input
                    type="text"
                    className="input"
                    placeholder="Składnik"
                    value={row.ingredient}
                    onChange={(e) => updateIngredient(i, 'ingredient', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input input-amount"
                    placeholder="Ilość"
                    value={row.amount}
                    onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeIngredient(i)}
                      aria-label="Usuń składnik"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="add-row-btn" onClick={addIngredient}>
              + Dodaj składnik
            </button>
          </div>

          <div className="field">
            <label className="label">Tagi</label>
            <div className="tag-input-row" ref={tagWrapperRef}>
              <div className="dialog-tag-input-wrapper">
                <input
                  type="text"
                  className="input"
                  placeholder="np. wegetariańskie"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value)
                    setShowTagSuggestions(true)
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      visibleSuggestions.length > 0 && tagInput === ''
                        ? selectSuggestedTag(visibleSuggestions[0])
                        : addTag()
                    }
                  }}
                />
                {showTagSuggestions && visibleSuggestions.length > 0 && (
                  <ul className="tag-suggestions" role="listbox">
                    {visibleSuggestions.map((tag) => (
                      <li key={tag} role="option" aria-selected={false}>
                        <button
                          className="tag-suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectSuggestedTag(tag)
                          }}
                        >
                          #{tag}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" className="add-tag-btn" onClick={addTag}>
                Dodaj
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags dialog-tags">
                {tags.map((tag) => (
                  <span key={tag} className="tag tag-removable">
                    #{tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                      aria-label={`Usuń tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <label className="label">Przygotowanie</label>
            <textarea
              className="input textarea"
              placeholder="Opisz kroki przygotowania..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          {error && <p className="form-error">⚠️ {error}</p>}

          <div className="dialog-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Anuluj
            </button>
            <button type="submit" className="btn-submit" disabled={loading || !title.trim()}>
              {loading ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Zapisz przepis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
