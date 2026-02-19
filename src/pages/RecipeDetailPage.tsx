import { useState, useEffect, useRef } from 'react'
import type { Recipe, TypeOfDish } from '../types/recipe'
import { getRecipeByUuid, addPhoto, deleteRecipe, incrementCookCount } from '../api/recipeApi'
import AddRecipeDialog from '../components/AddRecipeDialog'
import { binaryToDataUrl } from '../utils/image'

interface Props {
  uuid: string
  onBack: () => void
}

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

const ACCEPTED = '.jpg,.jpeg,.png'


export default function RecipeDetailPage({ uuid, onBack }: Props) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [cooking, setCooking] = useState(false)
  const [cookError, setCookError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function fetchRecipe() {
    setLoading(true)
    setError(null)
    getRecipeByUuid(uuid)
      .then((data) => setRecipe(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Błąd pobierania przepisu'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRecipe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid])

  async function handleCook() {
    setCooking(true)
    setCookError(null)
    try {
      const updated = await incrementCookCount(uuid)
      setRecipe(updated)
    } catch (err) {
      setCookError(err instanceof Error ? err.message : 'Błąd')
    } finally {
      setCooking(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteRecipe(uuid)
      onBack()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Błąd usuwania przepisu')
      setDeleting(false)
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploading(true)
    setUploadError(null)
    try {
      await addPhoto(uuid, file)
      fetchRecipe()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Błąd wysyłania zdjęcia')
    } finally {
      setUploading(false)
    }
  }

  const images = (recipe?.images ?? [])
    .map((b) => binaryToDataUrl(b))
    .filter((src): src is string => src !== null)

  return (
    <div className="page">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Wróć do listy
        </button>
        {recipe && !loading && (
          <>
            <button className="btn-edit-recipe" onClick={() => setShowEdit(true)}>
              ✏️ Edytuj
            </button>
            <button className="btn-delete-recipe" onClick={() => setShowConfirm(true)}>
              🗑️ Usuń
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="state-msg">
          <div className="spinner" />
          <span>Ładowanie przepisu...</span>
        </div>
      )}

      {error && (
        <div className="state-msg error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {recipe && !loading && (
        <article className="recipe-detail">
          <div className="detail-title-row">
            <h1 className="detail-title">{recipe.title}</h1>
            {recipe.typeOfDish && (
              <span className={`badge badge-lg ${TYPE_COLORS[recipe.typeOfDish]}`}>
                {DISH_LABELS[recipe.typeOfDish]}
              </span>
            )}
          </div>

          <div className="cook-counter">
            <button
              className="btn-cook"
              onClick={handleCook}
              disabled={cooking}
              title="Kliknij, aby oznaczyć że właśnie ugotowałeś ten przepis"
            >
              {cooking ? '…' : '🍳 Ugotowane!'}
            </button>
            <div className="cook-count-display">
              <span className="cook-count-number">{recipe.cookCount ?? 0}</span>
              <span className="cook-count-label">
                {(recipe.cookCount ?? 0) === 1 ? 'raz' : 'razy'}
              </span>
            </div>
            {cookError && <span className="cook-error">⚠️ {cookError}</span>}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="tags detail-tags">
              {recipe.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Galeria zdjęć ── */}
          <section className="detail-section">
            <h2 className="section-title">Galeria</h2>

            {images.length > 0 ? (
              <div className="gallery">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className="gallery-item"
                    onClick={() => setLightbox(src)}
                    aria-label={`Zdjęcie ${i + 1}`}
                  >
                    <img src={src} alt={`Zdjęcie ${i + 1}`} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="gallery-empty">Brak zdjęć</p>
            )}

            <div className="gallery-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden-file-input"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner spinner-sm" /> Wysyłanie…
                  </>
                ) : (
                  '+ Dodaj zdjęcie'
                )}
              </button>
              {uploadError && <p className="form-error">{uploadError}</p>}
            </div>
          </section>

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <section className="detail-section">
              <h2 className="section-title">Składniki</h2>
              <table className="ingredients-table">
                <thead>
                  <tr>
                    <th>Składnik</th>
                    <th>Ilość</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.ingredients.map((ing, i) => (
                    <tr key={i}>
                      <td>{ing.ingredient}</td>
                      <td className="amount">{ing.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {recipe.content && (
            <section className="detail-section">
              <h2 className="section-title">Przygotowanie</h2>
              <div className="recipe-content">
                {recipe.content.split('\n').map((para, i) =>
                  para.trim() ? <p key={i}>{para}</p> : null,
                )}
              </div>
            </section>
          )}
        </article>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Podgląd zdjęcia"
        >
          <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Zamknij">
            ×
          </button>
          <img
            className="lightbox-img"
            src={lightbox}
            alt="Podgląd"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showEdit && recipe && (
        <AddRecipeDialog
          recipe={recipe}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            fetchRecipe()
          }}
        />
      )}

      {showConfirm && recipe && (
        <div className="dialog-overlay" onClick={() => !deleting && setShowConfirm(false)}>
          <div
            className="dialog confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">🗑️</div>
            <h2 className="confirm-title" id="confirm-title">
              Usuń przepis
            </h2>
            <p className="confirm-msg">
              Czy na pewno chcesz usunąć przepis{' '}
              <strong>„{recipe.title}"</strong>?<br />
              Tej operacji nie można cofnąć.
            </p>
            {deleteError && <p className="form-error">{deleteError}</p>}
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Anuluj
              </button>
              <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Usuwanie…' : 'Tak, usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
