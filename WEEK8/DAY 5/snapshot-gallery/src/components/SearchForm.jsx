import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchForm() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const query = searchTerm.trim()
    if (!query) return
    navigate(`/search/${encodeURIComponent(query)}`)
    setSearchTerm('')
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <Search className="search-icon" size={19} strokeWidth={1.8} aria-hidden="true" />
      <input aria-label="Search photos" autoComplete="off" name="search" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search a place, subject, or mood" type="search" value={searchTerm} />
      <button type="submit" disabled={!searchTerm.trim()}>
        <Search size={15} aria-hidden="true" />
        <span className="search-button-label">Search</span>
      </button>
    </form>
  )
}

export default SearchForm