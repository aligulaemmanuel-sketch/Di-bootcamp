const content = document.getElementById('content');
const button = document.getElementById('find-button');

async function getCharacter() {
    // 1. Show Loading State
    content.innerHTML = '<i class="fa-solid fa-spinner fa-spin-pulse fa-3x"></i><p>Loading...</p>';
    
    try {
        // 2. Generate random ID (API has 83 characters)
        const randomId = Math.floor(Math.random() * 83) + 1;
        
        const response = await fetch(`https://www.swapi.tech/api/people/${randomId}`);
        const data = await response.json();

        if (data.message === "not found") {
            throw new Error("Person not available");
        }

        const character = data.result.properties;

        // 3. Fetch Home World Name (it's a separate link in the API)
        const homeResponse = await fetch(character.homeworld);
        const homeData = await homeResponse.json();
        const homeWorld = homeData.result.properties.name;

        // 4. Update UI
        content.innerHTML = `
            <h2>${character.name}</h2>
            <p>Height: ${character.height}</p>
            <p>Gender: ${character.gender}</p>
            <p>Birth Year: ${character.birth_year}</p>
            <p>Home World: ${homeWorld}</p>
        `;

    } catch (error) {
        content.innerHTML = `<h3>Oh no! That person isn't available.</h3>`;
    }
}

button.addEventListener('click', getCharacter);