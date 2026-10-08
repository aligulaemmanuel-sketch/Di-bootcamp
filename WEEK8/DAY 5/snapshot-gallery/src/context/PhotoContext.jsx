import axios from 'axios'
import { useCallback, useMemo, useState } from 'react'
import { PhotoContext } from './PhotoContextStore.jsx'

const demoPhotos = [
  { id: 'm1', category: 'mountain', alt: 'Snow-covered peaks under a pale sky', photographer: 'Marek Piwnicki', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85' },
  { id: 'm2', category: 'mountain', alt: 'A quiet alpine lake below the mountains', photographer: 'Luca Bravo', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85' },
  { id: 'm3', category: 'mountain', alt: 'Mountain ridge beneath a dark blue night sky', photographer: 'Simon Berger', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85' },
  { id: 'm4', category: 'mountain', alt: 'Sunlight reaching into a forest valley', photographer: 'Luca Bravo', url: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=85' },
  { id: 'b1', category: 'beach', alt: 'Foam folding over a turquoise shore', photographer: 'Jakob Owens', url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=85' },
  { id: 'b2', category: 'beach', alt: 'Blue water and a long strip of white sand', photographer: 'Luca Bravo', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85' },
  { id: 'b3', category: 'beach', alt: 'A sunlit beach with gentle waves', photographer: 'Sean Oulashin', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=85' },
  { id: 'b4', category: 'beach', alt: 'Open water seen from a quiet coast', photographer: 'Frank McKenna', url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=85' },
  { id: 'w1', category: 'birds', alt: 'A bright bird perched among green leaves', photographer: 'Boris Smokrovic', url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1200&q=85' },
  { id: 'w2', category: 'birds', alt: 'A small bird resting on a branch', photographer: 'Petr Sevcovic', url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1200&q=85' },
  { id: 'w3', category: 'birds', alt: 'Colorful feathers in soft daylight', photographer: 'David Clode', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=85' },
  { id: 'w4', category: 'birds', alt: 'Wild bird framed by a natural green habitat', photographer: 'James Wainscoat', url: 'https://images.unsplash.com/photo-1534330207526-488f4393e7a0?auto=format&fit=crop&w=1200&q=85' },
  { id: 'f1', category: 'food', alt: 'A fresh bowl of greens and vegetables', photographer: 'Anna Pelzer', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85' },
  { id: 'f2', category: 'food', alt: 'A rustic pizza topped with basil', photographer: 'Ivan Torres', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85' },
  { id: 'f3', category: 'food', alt: 'A plated meal on a wooden table', photographer: 'Lily Banse', url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1200&q=85' },
  { id: 'f4', category: 'food', alt: 'A colorful spread of fresh ingredients', photographer: 'Anna Pelzer', url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85' },
]

const aliases = {
  beaches: ['beach', 'coast', 'ocean', 'sea'],
  mountain: ['mountain', 'mountains', 'alpine', 'landscape'],
  birds: ['bird', 'birds', 'wildlife', 'feather'],
  food: ['food', 'meal', 'cuisine', 'dish'],
}

const apiKey = import.meta.env.VITE_PEXELS_API_KEY

function matchesPreview(photo, query) {
  const terms = aliases[query.toLowerCase()] || [query.toLowerCase()]
  return terms.some((term) => `${photo.category} ${photo.alt}`.toLowerCase().includes(term))
}

function PhotoContextProvider({ children }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [perPage, setPerPage] = useState(15)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)

  const runSearch = useCallback(async (query, limit = perPage, currentPage = 1) => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      setImages([])
      setTotalResults(0)
      setHasNextPage(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      if (apiKey) {
        const response = await axios.get('https://api.pexels.com/v1/search', {
          headers: { Authorization: apiKey },
          params: { query: normalizedQuery, per_page: limit, page: currentPage },
        })
        setImages(response.data.photos)
        setTotalResults(response.data.total_results)
        setHasNextPage(Boolean(response.data.next_page))
      } else {
        const matches = demoPhotos.filter((photo) => matchesPreview(photo, normalizedQuery))
        const start = (currentPage - 1) * limit
        setImages(matches.slice(start, start + limit).map((photo) => ({
          id: photo.id,
          alt: photo.alt,
          photographer: photo.photographer,
          url: photo.url,
          src: { medium: photo.url, large: photo.url, original: photo.url },
        })))
        setTotalResults(matches.length)
        setHasNextPage(start + limit < matches.length)
      }
    } catch (requestError) {
      setImages([])
      setTotalResults(0)
      setHasNextPage(false)
      setError(requestError.response?.status === 401
        ? 'The Pexels key was rejected. Check VITE_PEXELS_API_KEY in .env.local.'
        : 'The photo search could not load. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [perPage])

  const value = useMemo(() => ({
    images, loading, error, perPage, setPerPage, page, setPage,
    totalResults, hasNextPage, hasApiKey: Boolean(apiKey), runSearch,
  }), [images, loading, error, perPage, page, totalResults, hasNextPage, runSearch])

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>
}

export default PhotoContextProvider