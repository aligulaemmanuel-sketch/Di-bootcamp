import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { fetchData } from '../api/api'
import type { DataEntry, FetchArgs, QueryParams } from '../types/types'

export interface DataState {
  /** One entry per request key, e.g. "recipe-search". */
  entries: Record<string, DataEntry<unknown>>
}

const initialState: DataState = { entries: {} }

/** A stable "nothing requested yet" entry, so selectors return the same object. */
const IDLE_ENTRY: DataEntry<unknown> = {
  data: null,
  status: 'idle',
  error: null,
  signature: null,
}

/** A string that identifies a request, so old responses can be told from current ones. */
export function buildSignature(endpoint: string, params: QueryParams = {}): string {
  const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b))
  return `${endpoint}?${JSON.stringify(sorted)}`
}

// A local type avoids a circular import of RootState from the store.
interface SliceRootState {
  data: DataState
}

export const loadData = createAsyncThunk<
  unknown,
  FetchArgs,
  { state: SliceRootState; rejectValue: string }
>(
  'data/load',
  async ({ endpoint, params }, { rejectWithValue }) => {
    try {
      return await fetchData<unknown>(endpoint, params)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Something went wrong.')
    }
  },
  {
    // Skip duplicate requests: React StrictMode runs effects twice in development,
    // and re-mounting a component should not use up your API quota.
    condition: ({ key, endpoint, params, force }, { getState }) => {
      if (force) return true
      const entry = getState().data.entries[key]
      if (!entry) return true
      if (entry.signature !== buildSignature(endpoint, params)) return true
      return entry.status === 'idle' || entry.status === 'failed'
    },
  },
)

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearEntry(state, action: PayloadAction<string>) {
      delete state.entries[action.payload]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadData.pending, (state, action) => {
        const { key, endpoint, params } = action.meta.arg
        const signature = buildSignature(endpoint, params)
        const existing = state.entries[key]
        state.entries[key] = {
          // Keep nothing from an older, different request.
          data: existing?.signature === signature ? existing.data : null,
          status: 'loading',
          error: null,
          signature,
        }
      })
      .addCase(loadData.fulfilled, (state, action) => {
        const { key, endpoint, params } = action.meta.arg
        const entry = state.entries[key]
        // Ignore a late response for a request that has been replaced.
        if (!entry || entry.signature !== buildSignature(endpoint, params)) return
        entry.data = action.payload
        entry.status = 'succeeded'
        entry.error = null
      })
      .addCase(loadData.rejected, (state, action) => {
        const { key, endpoint, params } = action.meta.arg
        const entry = state.entries[key]
        if (!entry || entry.signature !== buildSignature(endpoint, params)) return
        entry.status = 'failed'
        entry.error = action.payload ?? action.error.message ?? 'Request failed.'
      })
  },
})

export const { clearEntry } = dataSlice.actions

/** Read one request's state, typed with the data you expect: selectEntry<MyResponse>(...). */
export function selectEntry<T>(state: SliceRootState, key: string): DataEntry<T> {
  return (state.data.entries[key] ?? IDLE_ENTRY) as DataEntry<T>
}

export default dataSlice.reducer
