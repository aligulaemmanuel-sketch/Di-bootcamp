import { v4 as uuidv4 } from 'uuid'

/** Plain shape of a recipe as stored in localStorage. */
export interface RecipeData {
  id: string
  title: string
  ingredients: string[]
  instructions: string
  isFavorite: boolean
}

export function isRecipeData(value: unknown): value is RecipeData {
  if (typeof value !== 'object' || value === null) return false
  const recipe = value as Record<string, unknown>
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.title === 'string' &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every((ingredient) => typeof ingredient === 'string') &&
    typeof recipe.instructions === 'string' &&
    typeof recipe.isFavorite === 'boolean'
  )
}

export default class RecipeItem {
  constructor(
    private readonly _id: string,
    private _title: string,
    private _ingredients: string[],
    private _instructions: string,
    private _isFavorite: boolean = false,
  ) {}

  /** Create a brand-new recipe with a unique id. */
  static create(title: string, ingredients: string[], instructions: string): RecipeItem {
    return new RecipeItem(uuidv4(), title, ingredients, instructions, false)
  }

  /** Rebuild a recipe from stored data. */
  static fromData(data: RecipeData): RecipeItem {
    return new RecipeItem(
      data.id,
      data.title,
      [...data.ingredients],
      data.instructions,
      data.isFavorite,
    )
  }

  get id(): string {
    return this._id
  }

  get title(): string {
    return this._title
  }

  set title(value: string) {
    this._title = value
  }

  get ingredients(): string[] {
    return this._ingredients
  }

  set ingredients(value: string[]) {
    this._ingredients = value
  }

  get instructions(): string {
    return this._instructions
  }

  set instructions(value: string) {
    this._instructions = value
  }

  get isFavorite(): boolean {
    return this._isFavorite
  }

  set isFavorite(value: boolean) {
    this._isFavorite = value
  }

  toggleFavorite(): void {
    this._isFavorite = !this._isFavorite
  }

  toData(): RecipeData {
    return {
      id: this._id,
      title: this._title,
      ingredients: this._ingredients,
      instructions: this._instructions,
      isFavorite: this._isFavorite,
    }
  }
}
