import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecipeCollection from '../src/model/RecipeCollection'
import RecipeItem from '../src/model/RecipeItem'

const STORAGE_KEY = 'recipes'

describe('RecipeCollection', () => {
  let values: Map<string, string>

  beforeEach(() => {
    values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    })
  })

  it('persists recipes and restores them as RecipeItem instances', () => {
    const collection = new RecipeCollection()
    collection.addRecipe(RecipeItem.create('Tomato soup', ['tomatoes'], 'Simmer'))
    collection.toggleFavorite(collection.recipes[0].id)

    const restored = new RecipeCollection()
    restored.load()

    expect(restored.recipes).toHaveLength(1)
    expect(restored.recipes[0]).toBeInstanceOf(RecipeItem)
    expect(restored.recipes[0].title).toBe('Tomato soup')
    expect(restored.recipes[0].isFavorite).toBe(true)
  })

  it('starts with an empty collection when stored recipe data is malformed', () => {
    values.set(STORAGE_KEY, JSON.stringify([{ id: 'broken', ingredients: null }]))
    const collection = new RecipeCollection()

    collection.load()

    expect(collection.recipes).toEqual([])
  })

  it('removes recipes and persists the updated collection', () => {
    const collection = new RecipeCollection()
    const recipe = RecipeItem.create('Tomato soup', ['tomatoes'], 'Simmer')
    collection.addRecipe(recipe)

    collection.removeRecipe(recipe.id)

    expect(JSON.parse(values.get(STORAGE_KEY) ?? 'null')).toEqual([])
  })
})
