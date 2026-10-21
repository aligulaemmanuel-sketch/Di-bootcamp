import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useLibraryData } from '../hooks/useLibraryData'
import { useAppSelector } from '../hooks/redux'
import styles from './DataTools.module.css'

function DataTools() {
  const { exportLibrary, importFromFile, isImporting, message } = useLibraryData()
  const bookCount = useAppSelector((state) => state.books.items.length)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    const confirmed =
      bookCount === 0 ||
      window.confirm('Importing replaces your current library. Do you want to continue?')

    if (confirmed) await importFromFile(file)
    input.value = '' // allow choosing the same file again
  }

  return (
    <section className="panel" aria-labelledby="data-title">
      <h2 className="panel-title" id="data-title">
        Your data
      </h2>
      <p className={styles.hint}>
        Your library is saved in this browser automatically. Export a backup or move it to another
        device.
      </p>

      <div className={styles.row}>
        <button type="button" className="btn" onClick={exportLibrary} disabled={bookCount === 0}>
          Export JSON
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => fileInput.current?.click()}
          disabled={isImporting}
        >
          {isImporting ? 'Importing…' : 'Import JSON'}
        </button>
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          tabIndex={-1}
          aria-label="Choose a library JSON file to import"
        />
      </div>

      {message && (
        <p
          className={message.type === 'error' ? 'error-text' : 'success-text'}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}
    </section>
  )
}

export default DataTools
