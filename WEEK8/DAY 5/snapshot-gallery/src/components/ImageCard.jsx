import { ArrowUpRight } from 'lucide-react'

function ImageCard({ photo, index }) {
  const aspectClass = index % 5 === 1 ? 'photo-card--portrait' : index % 5 === 3 ? 'photo-card--wide' : ''
  const imageUrl = photo.src?.large || photo.src?.medium || photo.url

  return (
    <li className={`photo-card ${aspectClass}`}>
      <a href={photo.src?.original || photo.url || imageUrl} target="_blank" rel="noreferrer" aria-label={`Open ${photo.alt} by ${photo.photographer}`}>
        <img src={imageUrl} alt={photo.alt || 'Photo from the gallery'} loading="lazy" />
        <span className="photo-overlay">
          <span className="photo-title">{photo.alt || 'Untitled photograph'}</span>
          <span className="photo-credit">{photo.photographer}<ArrowUpRight size={14} aria-hidden="true" /></span>
        </span>
      </a>
    </li>
  )
}

export default ImageCard