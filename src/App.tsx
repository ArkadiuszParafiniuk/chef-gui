import { useState } from 'react'
import './App.css'
import RecipeListPage from './pages/RecipeListPage'
import RecipeDetailPage from './pages/RecipeDetailPage'

type View = { type: 'list' } | { type: 'detail'; uuid: string }

function getInitialView(): View {
  const params = new URLSearchParams(window.location.search)
  const uuid = params.get('recipe')
  return uuid ? { type: 'detail', uuid } : { type: 'list' }
}

function App() {
  const [view, setView] = useState<View>(getInitialView)

  const navigateToDetail = (uuid: string) => {
    history.pushState(null, '', `?recipe=${uuid}`)
    setView({ type: 'detail', uuid })
  }

  const navigateToList = () => {
    history.pushState(null, '', window.location.pathname)
    setView({ type: 'list' })
  }

  return (
    <div className="app">
      {view.type === 'list' ? (
        <RecipeListPage onSelectRecipe={navigateToDetail} />
      ) : (
        <RecipeDetailPage uuid={view.uuid} onBack={navigateToList} />
      )}
    </div>
  )
}

export default App
