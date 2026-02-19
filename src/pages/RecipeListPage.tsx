import { useState, useEffect } from 'react'
import type { Recipe, TypeOfDish } from '../types/recipe'
import { getAllRecipes, findRecipes } from '../api/recipeApi'
import AddRecipeDialog from '../components/AddRecipeDialog'
import TagFilter from '../components/TagFilter'
import { firstImageUrl } from '../utils/image'

interface Props {
  onSelectRecipe: (uuid: string) => void
}

const DISH_TYPES: TypeOfDish[] = ['BREAKFAST', 'DINNER', 'DESSERT', 'DRINK']

const DISH_LABELS: Record<TypeOfDish, string> = {
  BREAKFAST: 'Śniadanie',
  DINNER: 'Obiad',
  DESSERT: 'Deser',
  DRINK: 'Napój',
}

const TYPE_COLORS: Record<TypeOfDish, string> = {
  BREAKFAST: 'badge-breakfast',
  DINNER: 'badge-dinner',
  DESSERT: 'badge-dessert',
  DRINK: 'badge-drink',
}

function pluralRecipes(n: number): string {
  if (n === 1) return 'przepis'
  if (n < 5) return 'przepisy'
  return 'przepisów'
}

function pluralIngredients(n: number): string {
  if (n === 1) return 'składnik'
  if (n < 5) return 'składniki'
  return 'składników'
}

export default function RecipeListPage({ onSelectRecipe }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [typeOfDish, setTypeOfDish] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        let data: Recipe[]
        if (title || typeOfDish || selectedTags.length > 0) {
          data = await findRecipes({
            title: title || undefined,
            typeOfDish: typeOfDish || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
          })
        } else {
          data = await getAllRecipes()
        }
        setRecipes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd pobierania przepisów')
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [title, typeOfDish, selectedTags, refreshKey])

  return (
    <div className="page">
      <header className="app-header">
        <h1>PRZEPIŚNIK</h1>
        <div className="header-divider" />
        <p className="header-subtitle">Kuchnia Asi i Arka</p>
      </header>

      <div className="search-section">
        <div className="search-row">
          <button className="btn-add-recipe" onClick={() => setShowDialog(true)}>
            + Dodaj nowy przepis
          </button>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Szukaj przepisu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {title && (
              <button className="clear-btn" onClick={() => setTitle('')}>
                ×
              </button>
            )}
          </div>
          <select
            className="type-select"
            value={typeOfDish}
            onChange={(e) => setTypeOfDish(e.target.value)}
          >
            <option value="">Wszystkie typy</option>
            {DISH_TYPES.map((t) => (
              <option key={t} value={t}>
                {DISH_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <TagFilter selectedTags={selectedTags} onChange={setSelectedTags} />
      </div>

      <div className="content">
        {loading && (
          <div className="state-msg">
            <div className="spinner" />
            <span>Ładowanie przepisów...</span>
          </div>
        )}
        {error && (
          <div className="state-msg error">
            <span>⚠️ {error}</span>
          </div>
        )}
        {!loading && !error && recipes.length === 0 && (
          <div className="state-msg">
            <span>🍽️ Brak przepisów</span>
          </div>
        )}
        {!loading && !error && recipes.length > 0 && (
          <>
            <p className="results-count">
              {recipes.length} {pluralRecipes(recipes.length)}
            </p>
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <button
                  key={recipe.uuid}
                  className="recipe-card"
                  onClick={() => onSelectRecipe(recipe.uuid)}
                >
                  {firstImageUrl(recipe.images) ? (
                    <div className="card-image">
                      <img src={firstImageUrl(recipe.images)!} alt={recipe.title} />
                    </div>
                  ) : (
                    <div className="card-image card-image--placeholder">
                      <span>🍽️</span>
                    </div>
                  )}
                  <div className="card-body">
                    <h2 className="card-title">{recipe.title}</h2>
                    {recipe.typeOfDish && (
                      <span className={`badge ${TYPE_COLORS[recipe.typeOfDish]}`}>
                        {DISH_LABELS[recipe.typeOfDish]}
                      </span>
                    )}

                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="tags">
                        {recipe.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="card-footer">
                      {recipe.ingredients.length} {pluralIngredients(recipe.ingredients.length)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {showDialog && (
        <AddRecipeDialog
          onClose={() => setShowDialog(false)}
          onSaved={() => {
            setShowDialog(false)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}
