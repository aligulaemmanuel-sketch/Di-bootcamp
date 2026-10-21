import { useRemoveBook, useToggleRead, useVisibleBooks } from '../hooks/useBooks'
import BookItem from './BookItem'
import styles from './BookList.module.css'

function BookList() {
  const { books, total, searchQuery } = useVisibleBooks()
  const toggleRead = useToggleRead()
  const removeBook = useRemoveBook()

  if (total === 0) {
    return (
      <p className={styles.empty}>Your library is empty. Add your first book to get started!</p>
    )
  }

  if (books.length === 0) {
    return <p className={styles.empty}>No books match your search or filters.</p>
  }

  return (
    <>
      <p className={styles.count} aria-live="polite">
        Showing {books.length} of {total} {total === 1 ? 'book' : 'books'}
      </p>
      <ul className={styles.grid}>
        {books.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            searchQuery={searchQuery}
            onToggleRead={toggleRead}
            onRemove={removeBook}
          />
        ))}
      </ul>
    </>
  )
}

export default BookList
