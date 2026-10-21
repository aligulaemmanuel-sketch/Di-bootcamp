import type { Book } from '../model/Book'
import Highlight from './Highlight'
import styles from './BookItem.module.css'

interface BookItemProps {
  book: Book
  searchQuery: string
  onToggleRead: (id: string) => void
  onRemove: (id: string) => void
}

function BookItem({ book, searchQuery, onToggleRead, onRemove }: BookItemProps) {
  const added = new Date(book.dateAdded).toLocaleDateString()

  return (
    <li className={`${styles.card} ${book.isRead ? styles.read : ''}`}>
      <div className={styles.header}>
        <span className={styles.category}>{book.category}</span>
        <span className={styles.status}>{book.isRead ? 'Read' : 'Unread'}</span>
      </div>

      <h3 className={styles.title}>
        <Highlight text={book.title} query={searchQuery} />
      </h3>
      <p className={styles.author}>
        by <Highlight text={book.author} query={searchQuery} />
      </p>
      <p className={styles.date}>Added {added}</p>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn"
          aria-pressed={book.isRead}
          onClick={() => onToggleRead(book.id)}
        >
          {book.isRead ? 'Mark unread' : 'Mark as read'}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          aria-label={`Remove ${book.title}`}
          onClick={() => onRemove(book.id)}
        >
          Remove
        </button>
      </div>
    </li>
  )
}

export default BookItem
