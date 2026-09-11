const API_KEY = 'hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My';
const RANDOM_ENDPOINT = 'https://api.giphy.com/v1/gifs/random';

const form = document.getElementById('gif-form');
const searchInput = document.getElementById('gif-search');
const gifContainer = document.getElementById('gif-container');
const errorMessage = document.getElementById('error-message');
const deleteAllBtn = document.getElementById('delete-all-btn');

// --- Form submission: fetch one random gif for the searched category ---
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const tag = searchInput.value.trim();
  if (!tag) return;

  clearError();
  await fetchRandomGif(tag);

  form.reset();
});

// --- Fetch a random gif from Giphy, using async/await + try/catch ---
async function fetchRandomGif(tag) {
  const url = `${RANDOM_ENDPOINT}?api_key=${API_KEY}&tag=${encodeURIComponent(tag)}&rating=g`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Giphy API responded with status ${response.status}`);
    }

    const result = await response.json();

    // Giphy returns {} for "data" when nothing matches the tag.
    const gifUrl = result?.data?.images?.original?.url;

    if (!gifUrl) {
      throw new Error(`No gif found for "${tag}"`);
    }

    appendGif(gifUrl, tag);
  } catch (error) {
    console.error('Failed to fetch gif:', error);
    showError(`Couldn't find a gif for "${tag}". Try a different search.`);
  }
}

// --- Add a gif card (image + delete button) to the page ---
function appendGif(url, tag) {
  const card = document.createElement('div');
  card.className = 'gif-card';

  const img = document.createElement('img');
  img.src = url;
  img.alt = `Random gif for "${tag}"`;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'DELETE';
  deleteBtn.addEventListener('click', () => card.remove());

  const label = document.createElement('div');
  label.className = 'tag-label';
  label.textContent = tag;

  card.appendChild(img);
  card.appendChild(deleteBtn);
  card.appendChild(label);

  gifContainer.prepend(card);
}

// --- Delete all gifs currently on the page ---
deleteAllBtn.addEventListener('click', () => {
  gifContainer.innerHTML = '';
});

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = '';
}
