import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { addCategory, deleteCategory, renameCategory } from '../features/books/booksSlice'
import { UNCATEGORIZED } from '../model/Book'

const MAX_NAME_LENGTH = 30

/**
 * Category list, per-category book counts, and create / rename / delete actions.
 * Each action returns an error message, or null when it succeeded.
 */
export function useCategories() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((state) => state.books.categories)
  const items = useAppSelector((state) => state.books.items)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const book of items) {
      map.set(book.category, (map.get(book.category) ?? 0) + 1)
    }
    return map
  }, [items])

  const validateName = useCallback(
    (name: string, ignore?: string): string | null => {
      if (!name) return 'Please enter a category name.'
      if (name.length > MAX_NAME_LENGTH) {
        return `Category names must be ${MAX_NAME_LENGTH} characters or fewer.`
      }
      const clash = categories.some(
        (c) => c !== ignore && c.toLowerCase() === name.toLowerCase(),
      )
      return clash ? 'That category already exists.' : null
    },
    [categories],
  )

  const createCategory = useCallback(
    (rawName: string): string | null => {
      const name = rawName.trim()
      const error = validateName(name)
      if (error) return error
      dispatch(addCategory(name))
      return null
    },
    [dispatch, validateName],
  )

  const editCategory = useCallback(
    (from: string, rawName: string): string | null => {
      if (from === UNCATEGORIZED) return `"${UNCATEGORIZED}" cannot be renamed.`
      const to = rawName.trim()
      if (to === from) return null
      const error = validateName(to, from)
      if (error) return error
      dispatch(renameCategory({ from, to }))
      return null
    },
    [dispatch, validateName],
  )

  const removeCategory = useCallback(
    (name: string): string | null => {
      if (name === UNCATEGORIZED) return `"${UNCATEGORIZED}" cannot be deleted.`
      dispatch(deleteCategory(name))
      return null
    },
    [dispatch],
  )

  return { categories, counts, createCategory, editCategory, removeCategory }
}
