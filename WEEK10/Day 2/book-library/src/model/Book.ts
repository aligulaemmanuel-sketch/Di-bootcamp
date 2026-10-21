export const UNCATEGORIZED = 'Uncategorized'
export const DEFAULT_CATEGORIES: readonly string[] = [
  'Fiction',
  'Non-fiction',
  'Science',
  'History',
  UNCATEGORIZED,
]

/** Plain, serializable shape of a book. This is what lives in the Redux store. */
export interface Book {
  id: string
  title: string
  author: string
  category: string
  isRead: boolean
  dateAdded: string // ISO 8601 timestamp
}

export function isBook(value: unknown): value is Book {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.author === 'string' &&
    typeof v.category === 'string' &&
    typeof v.isRead === 'boolean' &&
    typeof v.dateAdded === 'string'
  )
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Class wrapper around a Book: getters for convenient access plus
 * serialization methods. Redux state only ever holds the plain `Book`
 * (via `toJSON()`), because class instances are not serializable.
 */
export class BookItem {
  private readonly data: Book

  constructor(data: Book) {
    this.data = { ...data }
  }

  static create(title: string, author: string, category: string): BookItem {
    return new BookItem({
      id: generateId(),
      title: title.trim(),
      author: author.trim(),
      category,
      isRead: false,
      dateAdded: new Date().toISOString(),
    })
  }

  static fromJSON(json: unknown): BookItem {
    if (!isBook(json)) {
      throw new Error('Invalid book data')
    }
    return new BookItem(json)
  }

  get id(): string {
    return this.data.id
  }

  get title(): string {
    return this.data.title
  }

  get author(): string {
    return this.data.author
  }

  get category(): string {
    return this.data.category
  }

  get isRead(): boolean {
    return this.data.isRead
  }

  get dateAdded(): Date {
    return new Date(this.data.dateAdded)
  }

  get formattedDate(): string {
    return this.dateAdded.toLocaleDateString()
  }

  toJSON(): Book {
    return { ...this.data }
  }
}
