// Note: Run this in a browser console on a page that has a <body> tag
const planets = [
    { name: "Mercury", color: "gray", moons: 0 },
    { name: "Venus", color: "orange", moons: 0 },
    { name: "Earth", color: "blue", moons: 1 },
    { name: "Mars", color: "red", moons: 2 }
];

const section = document.querySelector(".listPlanets") || document.body;

planets.forEach(planet => {
    // Create Planet Div
    const planetDiv = document.createElement("div");
    planetDiv.classList.add("planet");
    planetDiv.style.backgroundColor = planet.color;
    planetDiv.innerText = planet.name;
    section.appendChild(planetDiv);

    // Bonus: Moons
    for (let i = 0; i < planet.moons; i++) {
        const moonDiv = document.createElement("div");
        moonDiv.classList.add("moon");
        // Simple offset to make moons visible
        moonDiv.style.left = (i * 30) + "px"; 
        planetDiv.appendChild(moonDiv);
    }
});