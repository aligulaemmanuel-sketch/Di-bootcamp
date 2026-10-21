import { DEFAULT_CATEGORIES, UNCATEGORIZED, isBook } from '../model/Book'
import type { Book } from '../model/Book'

const STORAGE_KEY = 'book-library:v1'

export interface PersistedLibrary {
  items: Book[]
  categories: string[]
}

/**
 * Validate unknown data (from localStorage or an imported file) and turn it
 * into a clean library. Throws an Error with a readable message if invalid.
 */
export function normalizeLibrary(value: unknown): PersistedLibrary {
  if (typeof value !== 'object' || value === null) {
    throw new Error('This file does not contain a valid library.')
  }

  const { items, categories } = value as { items?: unknown; categories?: unknown }

  if (!Array.isArray(items) || !items.every(isBook)) {
    throw new Error('The book data is missing or malformed.')
  }

  const cleanCategories: string[] =
    Array.isArray(categories) && categories.every((c) => typeof c === 'string')
      ? [...(categories as string[])]
      : [...DEFAULT_CATEGORIES]

  if (!cleanCategories.includes(UNCATEGORIZED)) cleanCategories.push(UNCATEGORIZED)

  // Make sure every book's category exists in the list.
  for (const book of items) {
    if (!cleanCategories.includes(book.category)) cleanCategories.push(book.category)
  }

  return { items: items.map((book) => ({ ...book })), categories: cleanCategories }
}

export function loadLibrary(): PersistedLibrary | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeLibrary(JSON.parse(raw))
  } catch {
    // Corrupted or unavailable storage: fall back to a fresh library.
    return null
  }
}

export function saveLibrary(library: PersistedLibrary): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  } catch {
    // Storage may be full or disabled; the app keeps working in memory.
  }
}
