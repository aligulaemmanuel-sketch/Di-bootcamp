import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { ENDPOINTS } from './api/api'
import { useAppDispatch } from './app/hooks'
import DataFetcher from './components/DataFetcher'
import { loadData } from './features/dataSlice'
import type {
  ComplexSearchResponse,
  QueryParams,
  RandomRecipe,
  RandomRecipesResponse,
  Recipe,
} from './types/types'

type Mode = 'search' | 'random'

const RANDOM_KEY = 'random-recipes'
const RANDOM_PARAMS: QueryParams = { number: 3 }

function App() {
  const dispatch = useAppDispatch()
  const [mode, setMode] = useState<Mode>('search')
  const [searchInput, setSearchInput] = useState<string>('pasta')
  const [query, setQuery] = useState<string>('pasta')

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) setQuery(trimmed)
  }

  const shuffle = (): void => {
    dispatch(
      loadData({ key: RANDOM_KEY, endpoint: ENDPOINTS.random, params: RANDOM_PARAMS, force: true }),
    )
  }

  return (
    <main className="app">
      <h1>Generic Data Fetcher</h1>
      <p className="subtitle">
        One typed <code>DataFetcher</code> component, two different API responses.
      </p>

      <div className="tabs" role="group" aria-label="Choose what to fetch">
        <button
          type="button"
          className={mode === 'search' ? 'active' : ''}
          aria-pressed={mode === 'search'}
          onClick={() => setMode('search')}
        >
          Search recipes
        </button>
        <button
          type="button"
          className={mode === 'random' ? 'active' : ''}
          aria-pressed={mode === 'random'}
          onClick={() => setMode('random')}
        >
          Random recipes
        </button>
      </div>

      {mode === 'search' ? (
        <section>
          <form className="search" onSubmit={handleSearch}>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search recipes, e.g. pasta"
              aria-label="Search recipes"
            />
            <button type="submit">Search</button>
          </form>

          <DataFetcher<ComplexSearchResponse, Recipe>
            dataKey="recipe-search"
            endpoint={ENDPOINTS.search}
            params={{ query, number: 6 }}
            getItems={(response) => response.results ?? []}
            emptyMessage={`No recipes found for "${query}".`}
            renderItem={(recipe) => (
              <>
                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                <h3>{recipe.title}</h3>
              </>
            )}
          />
        </section>
      ) : (
        <section>
          <button type="button" className="shuffle" onClick={shuffle}>
            Get new random recipes
          </button>

          <DataFetcher<RandomRecipesResponse, RandomRecipe>
            dataKey={RANDOM_KEY}
            endpoint={ENDPOINTS.random}
            params={RANDOM_PARAMS}
            getItems={(response) => response.recipes ?? []}
            renderItem={(recipe) => (
              <>
                {recipe.image && <img src={recipe.image} alt={recipe.title} loading="lazy" />}
                <h3>{recipe.title}</h3>
                <p className="meta">
                  {recipe.readyInMinutes} min · serves {recipe.servings}
                </p>
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                    View recipe
                  </a>
                )}
              </>
            )}
          />
        </section>
      )}
    </main>
  )
}

export default App
