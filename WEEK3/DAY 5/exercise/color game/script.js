const grid = document.querySelector('#grid-container');
let selectedColor = '#ef4444';
let isDrawing = false;

// 1. Generate the Grid (e.g., 20x20)
for (let i = 0; i < 400; i++) {
    const square = document.createElement('div');
    square.className = 'square';
    grid.appendChild(square);
}

// 2. Set Color from Palette
document.querySelector('#palette').addEventListener('click', (e) => {
    if (e.target.classList.contains('color')) {
        selectedColor = e.target.dataset.color;
        document.querySelectorAll('.color').forEach(color => color.classList.remove('selected'));
        e.target.classList.add('selected');
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
grid.addEventListener('dragstart', (e) => e.preventDefault());

document.querySelector('#clear-btn').addEventListener('click', () => {
    document.querySelectorAll('.square').forEach(square => square.style.backgroundColor = '#ffffff');
});