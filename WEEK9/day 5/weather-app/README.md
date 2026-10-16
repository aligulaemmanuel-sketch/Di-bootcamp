# Herolo Weather

A responsive weather app built with React, Redux Toolkit, Material UI and the AccuWeather API.

## Setup

1. Create an app at [developer.accuweather.com](https://developer.accuweather.com/) and copy its API key.
2. `cp .env.example .env` and paste the key into `VITE_ACCUWEATHER_API_KEY`.
3. `npm install`
4. `npm test` to run the selector tests.
5. `npm run dev`

The free AccuWeather tier allows 50 requests per day. Responses are cached in memory for 10 minutes to stay within that limit.

## Features

- Weather page: city search (English letters only), current conditions and a 5-day forecast, Tel Aviv by default
- Add or remove the shown city from favorites (stored in `localStorage`)
- Favorites page: ID, name and current weather per city; click one to open its details
- Redux Toolkit state management, toast-based error handling
- Bonus: browser geolocation for the default city, dark/light theme, °C/°F toggle, animations

## Deploy to GitHub Pages

Vite inlines the API key at build time, so keep `.env` in place when deploying:

```
npm run deploy
```

This builds the app and publishes `dist` to the `gh-pages` branch. The key ends up in the public bundle, which is unavoidable for a client-only app.
