import BookInput from './components/BookInput'
import BookList from './components/BookList'
import CategoryManager from './components/CategoryManager'
import DataTools from './components/DataTools'
import Filters from './components/Filters'
import Stats from './components/Stats'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>My Book Library</h1>
        <p>Track what you want to read, what you are reading, and what you have finished.</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <BookInput />
          <Stats />
          <CategoryManager />
          <DataTools />
        </aside>

        <main className={styles.main}>
          <Filters />
          <BookList />
        </main>
      </div>
    </div>
  )
}

export default App
