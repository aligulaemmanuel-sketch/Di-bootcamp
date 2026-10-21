import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../app/store'

// Typed versions of the plain react-redux hooks, used everywhere in the app.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
