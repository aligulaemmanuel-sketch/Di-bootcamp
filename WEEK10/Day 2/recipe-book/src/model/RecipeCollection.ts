import RecipeItem from './RecipeItem'
import { isRecipeData } from './RecipeItem'
import type { RecipeData } from './RecipeItem'

const STORAGE_KEY = 'recipes'

export default class RecipeCollection {
  private _recipes: RecipeItem[] = []

  get recipes(): RecipeItem[] {
    return this._recipes
  }

  addRecipe(recipe: RecipeItem): void {
    this._recipes.push(recipe)
    this.save()
  }

  removeRecipe(id: string): void {
    this._recipes = this._recipes.filter((recipe) => recipe.id !== id)
    this.save()
  }

  toggleFavorite(id: string): void {
    const recipe = this._recipes.find((r) => r.id === id)
    if (!recipe) return
    recipe.toggleFavorite()
    this.save()
  }

  clear(): void {
    this._recipes = []
    this.save()
  }

  save(): void {
    const data: RecipeData[] = this._recipes.map((recipe) => recipe.toData())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  load(): void {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed) || !parsed.every(isRecipeData)) {
        throw new Error('Stored recipes are malformed.')
      }
      this._recipes = parsed.map((data) => RecipeItem.fromData(data))
    } catch {
      // Corrupted storage: start with an empty collection instead of crashing.
      this._recipes = []
    }
  }
}
