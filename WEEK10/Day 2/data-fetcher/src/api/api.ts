import type { QueryParams } from '../types/types'

const DEFAULT_HOST = 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'

/** Endpoint paths of the Spoonacular API used in this app. */
export const ENDPOINTS = {
  search: '/recipes/complexSearch',
  random: '/recipes/random',
} as const

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
    case 403:
      return 'The API rejected your key. Check VITE_RAPIDAPI_KEY and that you are subscribed to the API.'
    case 404:
      return 'The requested endpoint was not found.'
    case 429:
      return 'Rate limit reached. Please wait a moment or check your plan quota.'
    default:
      return status >= 500
        ? 'The API is having problems. Please try again later.'
        : `Request failed with status ${status}.`
  }
}

/**
 * Generic fetch helper for the RapidAPI-hosted Spoonacular API.
 * `T` is the type of the JSON body you expect back.
 */
export async function fetchData<T>(
  endpoint: string,
  params: QueryParams = {},
  signal?: AbortSignal,
): Promise<T> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY
  if (!apiKey) {
    throw new ApiError(
      'Missing API key. Copy .env.example to .env, add your RapidAPI key, and restart the dev server.',
    )
  }

  const host = import.meta.env.VITE_RAPIDAPI_HOST || DEFAULT_HOST
  const url = new URL(`https://${host}${endpoint}`)
  Object.entries(params).forEach(([name, value]) => {
    url.searchParams.set(name, String(value))
  })

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host,
      },
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('Network error. Check your connection and try again.')
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('The API returned a response that is not valid JSON.')
  }
}
