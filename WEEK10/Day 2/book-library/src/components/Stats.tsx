import { useLibraryStats } from '../hooks/useBooks'
import styles from './Stats.module.css'

function Stats() {
  const { total, read, unread, percentRead, byCategory } = useLibraryStats()

  return (
    <section className="panel" aria-labelledby="stats-title">
      <h2 className="panel-title" id="stats-title">
        Reading progress
      </h2>

      <div className={styles.numbers}>
        <div>
          <strong>{total}</strong>
          <span>Total</span>
        </div>
        <div>
          <strong>{read}</strong>
          <span>Read</span>
        </div>
        <div>
          <strong>{unread}</strong>
          <span>Unread</span>
        </div>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-label="Share of books read"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentRead}
      >
        <div className={styles.fill} style={{ width: `${percentRead}%` }} />
      </div>
      <p className={styles.caption}>
        {total === 0 ? 'No books yet' : `${percentRead}% read (${read} of ${total})`}
      </p>

      <h3 className={styles.subtitle}>Books by category</h3>
      <ul className={styles.categories}>
        {byCategory.map((category) => (
          <li key={category.name}>
            <span>{category.name}</span>
            <span className={styles.badge}>{category.count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Stats
