import { AlertCircle, RefreshCw } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { PhotoContext } from '../context/PhotoContextStore.jsx'
import ImageCard from './ImageCard.jsx'
import NoImages from './NoImages.jsx'
import Pagination from './Pagination.jsx'

function Gallery({ searchTerm }) {
  const { images, loading, error, runSearch, perPage, page, setPage, totalResults, hasApiKey } = useContext(PhotoContext)

  useEffect(() => {
    if (page !== 1 && searchTerm) {
      setPage(1)
      return
    }
    runSearch(searchTerm, perPage, page)
  }, [searchTerm, perPage, page, runSearch, setPage])

  return (
    <section className="gallery-section" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <div>
          <h2 id="gallery-title">{searchTerm} / index</h2>
          <p className="result-count">{loading ? 'Finding photographs...' : `${totalResults.toLocaleString()} photographs`}</p>
        </div>
        {!hasApiKey && <span className="preview-badge">Preview collection</span>}
      </div>

      {error ? (
        <div className="error-state" role="alert">
          <AlertCircle size={24} aria-hidden="true" />
          <h3>Search unavailable</h3>
          <p>{error}</p>
          <button className="retry-button" type="button" onClick={() => runSearch(searchTerm, perPage, page)}>
            <RefreshCw size={15} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : loading ? (
        <div className="loader-state" role="status" aria-label="Loading photos">
          <span className="loader-spinner" />
          <span>Gathering a few good views...</span>
        </div>
      ) : images.length > 0 ? (
        <ul className="photo-grid">
          {images.map((photo, index) => <ImageCard key={photo.id} photo={photo} index={index} />)}
        </ul>
      ) : (
        <NoImages searchTerm={searchTerm} hasApiKey={hasApiKey} />
      )}

      <Pagination />
    </section>
  )
}

export default Gallery