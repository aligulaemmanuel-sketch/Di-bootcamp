import styles from './Highlight.module.css'

interface HighlightProps {
  text: string
  query: string
}

/** Renders `text`, wrapping every case-insensitive match of `query` in <mark>. */
function Highlight({ text, query }: HighlightProps) {
  const trimmed = query.trim()
  if (!trimmed) return <>{text}</>

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // With a capture group, split() puts the matches at the odd indexes.
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className={styles.mark}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

export default Highlight
