import { useState } from 'react'
import './App.css'
import RecipeListPage from './pages/RecipeListPage'
import RecipeDetailPage from './pages/RecipeDetailPage'

type View = { type: 'list' } | { type: 'detail'; uuid: string }

function App() {
  const [view, setView] = useState<View>({ type: 'list' })

  return (
    <div className="app">
      {view.type === 'list' ? (
        <RecipeListPage onSelectRecipe={(uuid) => setView({ type: 'detail', uuid })} />
      ) : (
        <RecipeDetailPage uuid={view.uuid} onBack={() => setView({ type: 'list' })} />
      )}
    </div>
  )
}

export default App
