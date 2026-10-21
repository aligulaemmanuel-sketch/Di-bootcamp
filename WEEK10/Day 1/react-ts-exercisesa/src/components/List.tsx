// Daily challenge: a generic, reusable list component.
import type { ReactNode } from 'react'

interface ListProps<T extends { id: number | string }> {
  items: T[]
  renderItem: (item: T) => ReactNode
}

// T is inferred from `items`, so renderItem gets a fully typed item.
function List<T extends { id: number | string }>({ items, renderItem }: ListProps<T>) {
  return (
    <ul className="user-list">
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

export default List
