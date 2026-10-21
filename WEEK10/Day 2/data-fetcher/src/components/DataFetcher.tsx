import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loadData, selectEntry } from '../features/dataSlice'
import type { QueryParams } from '../types/types'

interface DataFetcherProps<TResponse, TItem extends { id: number | string }> {
  /** Where this request's state is kept in the Redux store. */
  dataKey: string
  endpoint: string
  params?: QueryParams
  /** Pull the list of items out of the API response. */
  getItems: (response: TResponse) => TItem[]
  /** Decide how each item looks. */
  renderItem: (item: TItem) => ReactNode
  emptyMessage?: string
}

/**
 * Fetches `endpoint` into Redux and renders the result.
 *  - TResponse is the shape of the whole API response.
 *  - TItem is the shape of one item in the list.
 * Both are checked by TypeScript, so `renderItem` always receives a typed item.
 */
function DataFetcher<TResponse, TItem extends { id: number | string }>({
  dataKey,
  endpoint,
  params,
  getItems,
  renderItem,
  emptyMessage = 'Nothing found.',
}: DataFetcherProps<TResponse, TItem>) {
  const dispatch = useAppDispatch()
  const entry = useAppSelector((state) => selectEntry<TResponse>(state, dataKey))

  // Depend on the serialized params so a new-but-equal object does not refetch.
  const paramsKey = JSON.stringify(params ?? {})

  useEffect(() => {
    const parsedParams: QueryParams = JSON.parse(paramsKey)
    dispatch(loadData({ key: dataKey, endpoint, params: parsedParams }))
  }, [dispatch, dataKey, endpoint, paramsKey])

  const retry = (): void => {
    const parsedParams: QueryParams = JSON.parse(paramsKey)
    dispatch(loadData({ key: dataKey, endpoint, params: parsedParams, force: true }))
  }

  if (entry.status === 'idle' || entry.status === 'loading') {
    return (
      <div className="status loading" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading…
      </div>
    )
  }

  if (entry.status === 'failed' || entry.data === null) {
    return (
      <div className="status error" role="alert">
        <p>{entry.error ?? 'Something went wrong.'}</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  let items: TItem[]
  try {
    items = getItems(entry.data)
  } catch {
    return (
      <div className="status error" role="alert">
        <p>The API returned data in an unexpected format.</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return <p className="status empty">{emptyMessage}</p>
  }

  return (
    <ul className="card-grid">
      {items.map((item) => (
        <li key={item.id} className="card">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}

export default DataFetcher
