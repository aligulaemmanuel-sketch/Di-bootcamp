const API_KEY = 'hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My';
const SEARCH_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';

const form = document.getElementById('gif-form');
const searchInput = document.getElementById('gif-search');
const gifContainer = document.getElementById('gif-container');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  errorMessage.textContent = '';
  gifContainer.innerHTML = '';

  await fetchAndDisplayGif(query);
});

// Fetch a batch of gifs matching the search term, then display one at random.
async function fetchAndDisplayGif(query) {
  const url = `${SEARCH_ENDPOINT}?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=25&rating=g`;

  try {
    const response = await fetch(url);

    // Always check the response status before trusting the body.
    if (!response.ok) {
      throw new Error(`Giphy API responded with status ${response.status}`);
    }

    const result = await response.json();
    const gifs = result.data;

    if (!gifs || gifs.length === 0) {
      throw new Error(`No gifs found for "${query}"`);
    }

    // Pick one random gif from the batch of search results.
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const gifUrl = randomGif.images.original.url;

    displayGif(gifUrl, query);
  } catch (error) {
    console.error('Failed to fetch gif:', error);
    errorMessage.textContent = `Couldn't find a gif for "${query}". Try a different search.`;
  }
}

function displayGif(url, query) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = `Random gif for "${query}"`;
  gifContainer.appendChild(img);
}
