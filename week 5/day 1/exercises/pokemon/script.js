let currentId = 1; 

async function fetchPokemon(id) {
    const display = document.getElementById('pokemon-info');
    // Loading State
    display.innerHTML = '<img src="https://media.giphy.com/media/uAy18V5Yx71gA/giphy.gif" width="50px" alt="loading">';

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error("Pokemon not found");

        const data = await response.json();
        currentId = data.id; // Sync our global ID

        display.innerHTML = `
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <h3>${data.name.toUpperCase()}</h3>
            <p>ID: ${data.id}</p>
            <p>Height: ${data.height}</p>
            <p>Weight: ${data.weight}</p>
            <p>Type: ${data.types[0].type.name}</p>
        `;
    } catch (error) {
        display.innerHTML = `<h3>Oh No! That Pokémon isn't available...</h3>`;
    }
}

// Button Listeners
document.getElementById('random-btn').onclick = () => {
    const randomId = Math.floor(Math.random() * 898) + 1;
    fetchPokemon(randomId);
};

document.getElementById('next-btn').onclick = () => fetchPokemon(currentId + 1);
document.getElementById('prev-btn').onclick = () => {
    if (currentId > 1) fetchPokemon(currentId - 1);
};

// Initial Load
fetchPokemon(1);