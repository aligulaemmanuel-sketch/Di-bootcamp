import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { importLibrary } from '../features/books/booksSlice'
import { normalizeLibrary } from '../app/storage'

export interface StatusMessage {
  type: 'success' | 'error'
  text: string
}

/** Export the library to a JSON file, or import one back in. */
export function useLibraryData() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.books.items)
  const categories = useAppSelector((state) => state.books.categories)

  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [message, setMessage] = useState<StatusMessage | null>(null)

  const exportLibrary = useCallback((): void => {
    const json = JSON.stringify({ items, categories }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `book-library-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)

    setMessage({ type: 'success', text: `Exported ${items.length} book(s).` })
  }, [items, categories])

  const importFromFile = useCallback(
    async (file: File): Promise<void> => {
      setIsImporting(true)
      setMessage(null)
      try {
        const text = await file.text()
        const library = normalizeLibrary(JSON.parse(text))
        dispatch(importLibrary(library))
        setMessage({ type: 'success', text: `Imported ${library.items.length} book(s).` })
      } catch (err) {
        const text =
          err instanceof SyntaxError
            ? 'That file is not valid JSON.'
            : err instanceof Error
              ? err.message
              : 'Import failed.'
        setMessage({ type: 'error', text })
      } finally {
        setIsImporting(false)
      }
    },
    [dispatch],
  )

  return { exportLibrary, importFromFile, isImporting, message }
}
