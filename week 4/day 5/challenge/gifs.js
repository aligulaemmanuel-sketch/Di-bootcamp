const form = document.querySelector('form');
const container = document.getElementById('gif-container');
const searchBtn = document.getElementById('search-btn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('search');
    const searchTerm = input.value.trim();
    if (!searchTerm) return;

    searchBtn.textContent = 'Searching...';
    searchBtn.disabled = true;
    
    try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/random?tag=${searchTerm}&api_key=${apiKey}`);
        const { data } = await res.json();

        if (!data || Array.isArray(data) && data.length === 0 || !data.images) {
            throw new Error("No GIF found for that tag");
        }
        
        // Create elements
        const div = document.createElement('div');
        div.className = "bg-gray-50 p-2 rounded-lg border border-gray-200 flex flex-col gap-2 shadow-sm animate-fade-in";
        
        const img = document.createElement('img');
        img.className = "w-full h-40 object-cover rounded";
        img.src = data.images.fixed_height.url;

        const btn = document.createElement('button');
        btn.textContent = 'Delete';
        btn.className = "text-xs font-semibold text-red-500 hover:bg-red-50 p-1 rounded transition";
        
        // Single Delete logic
        btn.onclick = () => div.remove();
        
        div.append(img, btn);
        container.appendChild(div);
        input.value = '';
    } catch (err) {
        alert(err.message || "Search failed");
    } finally {
        searchBtn.textContent = 'Search';
        searchBtn.disabled = false;
    }
});

// Delete All button
document.getElementById('delete-all').onclick = () => container.innerHTML = '';