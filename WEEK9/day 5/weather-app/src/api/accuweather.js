const BASE_URL = 'https://dataservice.accuweather.com';
const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;

// The free tier allows 50 requests/day, so identical requests are served from memory
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const KEY_ERROR = 'Invalid or missing AccuWeather API key.';
const STATUS_MESSAGES = {
  401: KEY_ERROR,
  403: KEY_ERROR,
  503: 'AccuWeather daily request limit reached. Please try again later.',
};

async function request(path, params = {}) {
  if (!API_KEY) {
    throw new Error('Missing AccuWeather API key. Set VITE_ACCUWEATHER_API_KEY in your .env file.');
  }

  const cacheKey = `${path}?${new URLSearchParams(params)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.data;

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries({ ...params, apikey: API_KEY }).forEach(([name, value]) =>
    url.searchParams.set(name, value)
  );

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }
  if (!response.ok) {
    throw new Error(STATUS_MESSAGES[response.status] ?? `Request failed (${response.status}).`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, savedAt: Date.now() });
  return data;
}

const toLocation = (raw) => ({
  key: raw.Key,
  name: raw.LocalizedName,
  country: raw.Country.LocalizedName,
});

export async function searchLocations(query) {
  const results = await request('/locations/v1/cities/autocomplete', { q: query });
  return results.map(toLocation);
}

export async function getLocationByCoordinates(latitude, longitude) {
  const result = await request('/locations/v1/cities/geoposition/search', {
    q: `${latitude},${longitude}`,
  });
  return toLocation(result);
}

export async function getCurrentConditions(locationKey) {
  const [raw] = await request(`/currentconditions/v1/${locationKey}`);
  if (!raw) throw new Error('No current conditions are available for this location.');

  return {
    text: raw.WeatherText,
    icon: raw.WeatherIcon,
    tempC: raw.Temperature.Metric.Value,
  };
}

export async function getForecast(locationKey) {
  const raw = await request(`/forecasts/v1/daily/5day/${locationKey}`, { metric: true });

  return raw.DailyForecasts.map((day) => ({
    date: day.Date,
    minC: day.Temperature.Minimum.Value,
    maxC: day.Temperature.Maximum.Value,
    icon: day.Day.Icon,
    text: day.Day.IconPhrase,
  }));
}
