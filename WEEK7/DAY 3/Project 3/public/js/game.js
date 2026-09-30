const grid = document.getElementById('grid');
const turnDisplay = document.getElementById('turn-display');

async function loadGame() {
    const response = await fetch('/api/state');
    gameState = await response.json();
    renderGame();
}

function renderGame() {
    grid.replaceChildren();
    turnDisplay.textContent = gameState.winner ? `${gameState.winner.toUpperCase()} wins` : gameState.turn.toUpperCase();

    for (let y = 0; y < 10; y += 1) {
        for (let x = 0; x < 10; x += 1) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cell';
            cell.setAttribute('aria-label', `Row ${y + 1}, column ${x + 1}`);

            for (const [player, details] of Object.entries(gameState.players)) {
                if (details.pos.x === x && details.pos.y === y) {
                    cell.classList.add(player);
                    cell.textContent = player.toUpperCase();
                }
                if (details.base.x === x && details.base.y === y) {
                    cell.classList.add(`base-${player}`);
                }
            }

            if (gameState.obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y)) {
                cell.classList.add('obstacle');
            }

            cell.addEventListener('click', () => moveTo(x, y));
            grid.append(cell);
        }
    }
}

async function moveTo(x, y) {
    if (gameState.winner) return;

    const response = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: gameState.turn, target: { x, y } })
    });

    const result = await response.json();
    if (!response.ok) {
        window.alert(result.error);
        return;
    }

    gameState = result;
    renderGame();
}

let gameState;
loadGame().catch(() => window.alert('Unable to load the game.'));