const grid = document.querySelector('#grid-container');
let selectedColor = '#000000';
let isDrawing = false;

// 1. Generate the Grid (e.g., 20x20)
for (let i = 0; i < 400; i++) {
    const square = document.createElement('div');
    // Added Tailwind classes for size and initial color
    square.className = "square w-6 h-6 bg-white transition-colors duration-100";
    grid.appendChild(square);
}

// 2. Set Color from Palette
document.querySelector('#palette').addEventListener('click', (e) => {
    if (e.target.classList.contains('color')) {
        selectedColor = e.target.style.background;
        // Visual feedback for selected color
        document.querySelectorAll('.color').forEach(c => c.style.borderColor = 'transparent');
        e.target.style.borderColor = 'white';
    }
});

// 3. Improved Drawing Logic (Click and Drag)
const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    if (e.target.classList.contains('square')) {
        e.target.style.backgroundColor = selectedColor;
    }
};

grid.addEventListener('mousedown', (e) => {
    isDrawing = true;
    draw(e);
});
grid.addEventListener('mouseover', draw);
window.addEventListener('mouseup', () => isDrawing = false);
// Prevent dragging the actual ghost image of the div
grid.addEventListener('dragstart', (e) => e.preventDefault());