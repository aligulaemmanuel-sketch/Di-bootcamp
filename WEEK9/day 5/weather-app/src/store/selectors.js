import { createSelector } from '@reduxjs/toolkit';

export const selectLocation = (state) => state.weather.location;
export const selectCurrent = (state) => state.weather.current;
export const selectForecast = (state) => state.weather.forecast;
export const selectWeatherStatus = (state) => state.weather.status;
export const selectFavoritesWeather = (state) => state.weather.favoritesWeather;
export const selectFavorites = (state) => state.favorites.items;
export const selectThemeMode = (state) => state.settings.themeMode;
export const selectUnit = (state) => state.settings.unit;
export const selectToast = (state) => state.ui.toast;

export const selectIsFavorite = createSelector(
  [selectLocation, selectFavorites],
  (location, favorites) =>
    Boolean(location) && favorites.some((favorite) => favorite.key === location.key)
);
