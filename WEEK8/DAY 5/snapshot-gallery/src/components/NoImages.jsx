import { ImageOff } from 'lucide-react'

function NoImages({ searchTerm, hasApiKey }) {
  return (
    <div className="no-images" role="status">
      <ImageOff size={25} strokeWidth={1.5} aria-hidden="true" />
      <h3>No images found</h3>
      <p>
        {hasApiKey
          ? `There are no results for "${searchTerm}". Try a broader search.`
          : `There are no preview images for "${searchTerm}". Add a Pexels API key to search the full collection.`}
      </p>
    </div>
  )
}

export default NoImages