import { useState, useEffect, useRef } from 'react'
import { findTags } from '../api/recipeApi'

interface Props {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export default function TagFilter({ selectedTags, onChange }: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions whenever input or isOpen changes; skip when closed
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(async () => {
      try {
        const tags = await findTags(input.trim() || undefined)
        setSuggestions(tags.filter((t) => !selectedTags.includes(t)))
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [input, isOpen, selectedTags])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function selectTag(tag: string) {
    onChange([...selectedTags, tag])
    setInput('')
    // Dropdown stays open — user can keep selecting more tags
  }

  function removeTag(tag: string) {
    onChange(selectedTags.filter((t) => t !== tag))
  }

  // Safety: filter in render too, in case suggestions cache is stale
  const visible = suggestions.filter((t) => !selectedTags.includes(t))

  return (
    <div className="tag-filter" ref={containerRef}>
      <div className="tag-filter-row">
        <div className="tag-filter-input-wrapper">
          <span className="tag-filter-icon">🏷️</span>
          <input
            type="text"
            className="search-input"
            placeholder="Filtruj po tagach…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false)
              if (e.key === 'Enter' && visible.length > 0) {
                e.preventDefault()
                selectTag(visible[0])
              }
            }}
          />
          {isOpen && visible.length > 0 && (
            <ul className="tag-suggestions" role="listbox">
              {visible.map((tag) => (
                <li key={tag} role="option" aria-selected={false}>
                  <button
                    className="tag-suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectTag(tag)
                    }}
                  >
                    #{tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="tag-filter-chips">
          <span className="tag-filter-label">Filtruj:</span>
          {selectedTags.map((tag) => (
            <span key={tag} className="tag tag-chip-active tag-removable">
              #{tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Usuń filtr ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" className="clear-all-tags" onClick={() => onChange([])}>
            Wyczyść
          </button>
        </div>
      )}
    </div>
  )
}
