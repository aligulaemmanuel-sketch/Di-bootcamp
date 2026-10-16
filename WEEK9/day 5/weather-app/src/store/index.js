import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import favoritesReducer from './favoritesSlice';
import settingsReducer from './settingsSlice';
import uiReducer from './uiSlice';
import { loadPersistedState, persistState } from './storage';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    favorites: favoritesReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
  preloadedState: loadPersistedState(),
});

// Favorites and settings survive reloads (no server needed)
let persisted = {};
store.subscribe(() => {
  const { favorites, settings } = store.getState();
  if (favorites !== persisted.favorites || settings !== persisted.settings) {
    persisted = { favorites, settings };
    persistState(persisted);
  }
});
