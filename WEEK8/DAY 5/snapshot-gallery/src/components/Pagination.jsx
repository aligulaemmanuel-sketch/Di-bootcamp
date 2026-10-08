import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useContext } from 'react'
import { PhotoContext } from '../context/PhotoContextStore.jsx'

const pageSizes = [15, 30, 45]

function Pagination() {
  const { perPage, setPerPage, page, setPage, totalResults, hasNextPage, loading } = useContext(PhotoContext)
  const firstResult = totalResults === 0 ? 0 : (page - 1) * perPage + 1
  const lastResult = Math.min(page * perPage, totalResults)

  function changePageSize(size) {
    setPage(1)
    setPerPage(size)
  }

  return (
    <div className="gallery-controls" aria-label="Gallery pagination">
      <div className="page-size-control" aria-label="Images per page">
        <span className="control-label">Show</span>
        {pageSizes.map((size) => (
          <button key={size} type="button" aria-pressed={perPage === size} onClick={() => changePageSize(size)}>{size}</button>
        ))}
        <span className="control-label">per page</span>
      </div>
      <div className="page-navigation">
        <span className="page-indicator">{firstResult}-{lastResult} of {totalResults}</span>
        <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Next page" disabled={!hasNextPage || loading} onClick={() => setPage((current) => current + 1)}>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default Pagination