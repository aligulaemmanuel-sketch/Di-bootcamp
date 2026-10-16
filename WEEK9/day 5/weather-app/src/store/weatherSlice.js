import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getCurrentConditions,
  getForecast,
  getLocationByCoordinates,
  searchLocations,
} from '../api/accuweather';
import { DEFAULT_LOCATION } from '../constants';
import { getBrowserPosition } from '../utils/geolocation';

// Thunks reject with a plain message string, which the ui slice shows as a toast
const withMessage = (task) => async (arg, { rejectWithValue }) => {
  try {
    return await task(arg);
  } catch (error) {
    return rejectWithValue(error.message);
  }
};

export const searchCities = createAsyncThunk('weather/searchCities', withMessage(searchLocations));

export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  withMessage(async (locationKey) => {
    const [current, forecast] = await Promise.all([
      getCurrentConditions(locationKey),
      getForecast(locationKey),
    ]);
    return { current, forecast };
  })
);

export const fetchFavoriteWeather = createAsyncThunk(
  'weather/fetchFavoriteWeather',
  withMessage(getCurrentConditions)
);

// Never rejects: any geolocation or lookup failure falls back to the default city
export const resolveInitialLocation = createAsyncThunk(
  'weather/resolveInitialLocation',
  async () => {
    try {
      const { latitude, longitude } = await getBrowserPosition();
      return await getLocationByCoordinates(latitude, longitude);
    } catch {
      return DEFAULT_LOCATION;
    }
  },
  { condition: (_, { getState }) => getState().weather.locationStatus === 'idle' }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    location: null,
    locationStatus: 'idle',
    current: null,
    forecast: [],
    status: 'idle',
    favoritesWeather: {},
  },
  reducers: {
    setLocation(state, action) {
      state.location = action.payload;
      state.locationStatus = 'done';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resolveInitialLocation.pending, (state) => {
        state.locationStatus = 'pending';
      })
      .addCase(resolveInitialLocation.fulfilled, (state, action) => {
        // A location the user already picked wins over the detected one
        if (!state.location) state.location = action.payload;
        state.locationStatus = 'done';
      })
      .addCase(fetchWeather.pending, (state) => {
        state.status = 'loading';
        state.current = null;
        state.forecast = [];
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        // Ignore responses for a location the user has already moved away from
        if (action.meta.arg !== state.location?.key) return;
        state.status = 'succeeded';
        state.current = action.payload.current;
        state.forecast = action.payload.forecast;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        if (action.meta.arg === state.location?.key) state.status = 'failed';
      })
      .addCase(fetchFavoriteWeather.fulfilled, (state, action) => {
        state.favoritesWeather[action.meta.arg] = action.payload;
      });
  },
});

export const { setLocation } = weatherSlice.actions;
export default weatherSlice.reducer;
