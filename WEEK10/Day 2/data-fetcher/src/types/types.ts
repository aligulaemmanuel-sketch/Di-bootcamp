// ---------- Spoonacular API data ----------

/** One result from /recipes/complexSearch. */
export interface Recipe {
  id: number
  title: string
  image: string
  imageType?: string
}

export interface ComplexSearchResponse {
  results: Recipe[]
  offset: number
  number: number
  totalResults: number
}

/** One recipe from /recipes/random. */
export interface RandomRecipe {
  id: number
  title: string
  image?: string
  readyInMinutes: number
  servings: number
  sourceUrl?: string
}

export interface RandomRecipesResponse {
  recipes: RandomRecipe[]
}

// ---------- Request and Redux state ----------

export type QueryParams = Record<string, string | number | boolean>

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

/** The state of one request, generic over the type of data it returns. */
export interface DataEntry<T> {
  data: T | null
  status: RequestStatus
  error: string | null
  /** Identifies the request (endpoint + params) this entry belongs to. */
  signature: string | null
}

export interface FetchArgs {
  /** Where in the store this request's state lives. */
  key: string
  endpoint: string
  params?: QueryParams
  /** Fetch again even if the same request already succeeded. */
  force?: boolean
}
