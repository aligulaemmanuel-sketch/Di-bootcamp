const apiKey = "hpVzYck2zJ9n5cl6tlwN8BKK4q6dq2Hy";
const url = `https://api.giphy.com/v1/gifs/search?q=hilarious&rating=g&api_key=${apiKey}`;

// Using Async/Await with Error Handling (XP Gold Requirement)
async function getGiphyData() {
    try {
        const response = await fetch(url);
        
        // Always check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Giphy Data:", result.data);
        
        // Logic to append to DOM (for Exercise 1)
        const gifUrl = result.data[0].images.original.url;
        const img = document.createElement("img");
        img.src = gifUrl;
        document.body.appendChild(img);

    } catch (error) {
        // This handles "oooooops" scenarios like network failures
        console.log("oooooops", error);
    }
}

getGiphyData();