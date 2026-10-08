# Snapshot Gallery

A responsive React photo gallery with category routes, search, page-size controls, and Pexels API support.

## Run locally

```sh
npm install
npm run dev
```

The gallery starts with a small curated preview collection, so category pages work without credentials.

## Enable Pexels search

Copy `.env.example` to `.env.local`, then set `VITE_PEXELS_API_KEY` to a Pexels API key. Restart the Vite server after changing environment variables. Vite exposes client-side environment variables in the browser, so use an API key intended for public frontend use and apply any available restrictions.

## Build

```sh
npm run build
```