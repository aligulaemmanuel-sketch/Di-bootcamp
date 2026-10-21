import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { addBook as addBookAction, removeBook, toggleRead } from '../features/books/booksSlice'
import { BookItem } from '../model/Book'
import type { Book } from '../model/Book'

const MAX_LENGTH = 100

/** Add a book, with validation. `addBook` returns true when the book was added. */
export function useAddBook() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.books.items)
  const [error, setError] = useState<string | null>(null)

  const addBook = useCallback(
    (title: string, author: string, category: string): boolean => {
      const cleanTitle = title.trim()
      const cleanAuthor = author.trim()

      if (!cleanTitle) return fail('Please enter a title.')
      if (!cleanAuthor) return fail('Please enter an author.')
      if (cleanTitle.length > MAX_LENGTH || cleanAuthor.length > MAX_LENGTH) {
        return fail(`Title and author must be ${MAX_LENGTH} characters or fewer.`)
      }

      const duplicate = items.some(
        (book) =>
          book.title.toLowerCase() === cleanTitle.toLowerCase() &&
          book.author.toLowerCase() === cleanAuthor.toLowerCase(),
      )
      if (duplicate) return fail('This book is already in your library.')

      dispatch(addBookAction(BookItem.create(cleanTitle, cleanAuthor, category).toJSON()))
      setError(null)
      return true

      function fail(message: string): false {
        setError(message)
        return false
      }
    },
    [dispatch, items],
  )

  const clearError = useCallback(() => setError(null), [])

  return { addBook, error, clearError }
}

export function useRemoveBook() {
  const dispatch = useAppDispatch()
  return useCallback((id: string): void => {
    dispatch(removeBook(id))
  }, [dispatch])
}

export function useToggleRead() {
  const dispatch = useAppDispatch()
  return useCallback((id: string): void => {
    dispatch(toggleRead(id))
  }, [dispatch])
}

/** The books to display after applying status, category, search and sorting. */
export function useVisibleBooks() {
  const items = useAppSelector((state) => state.books.items)
  const statusFilter = useAppSelector((state) => state.books.statusFilter)
  const categoryFilter = useAppSelector((state) => state.books.categoryFilter)
  const searchQuery = useAppSelector((state) => state.books.searchQuery)
  const sortBy = useAppSelector((state) => state.books.sortBy)
  const sortDirection = useAppSelector((state) => state.books.sortDirection)

  const books = useMemo<Book[]>(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = items.filter((book) => {
      if (statusFilter === 'read' && !book.isRead) return false
      if (statusFilter === 'unread' && book.isRead) return false
      if (categoryFilter !== 'all' && book.category !== categoryFilter) return false
      if (query) {
        const haystack = `${book.title} ${book.author}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })

    const direction = sortDirection === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      if (sortBy === 'dateAdded') {
        return a.dateAdded.localeCompare(b.dateAdded) * direction
      }
      return a[sortBy].localeCompare(b[sortBy], undefined, { sensitivity: 'base' }) * direction
    })
  }, [items, statusFilter, categoryFilter, searchQuery, sortBy, sortDirection])

  return { books, total: items.length, searchQuery }
}

/** Totals for the statistics dashboard. */
export function useLibraryStats() {
  const items = useAppSelector((state) => state.books.items)
  const categories = useAppSelector((state) => state.books.categories)

  return useMemo(() => {
    const total = items.length
    const read = items.filter((book) => book.isRead).length
    const byCategory = categories
      .map((name) => ({
        name,
        count: items.filter((book) => book.category === name).length,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    return {
      total,
      read,
      unread: total - read,
      percentRead: total === 0 ? 0 : Math.round((read / total) * 100),
      byCategory,
    }
  }, [items, categories])
}
