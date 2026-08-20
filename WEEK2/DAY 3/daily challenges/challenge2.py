import random

class GameOfLife:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.grid = [[random.choice([0, 1]) for _ in range(cols)] for _ in range(rows)]

    def display(self):
        for row in self.grid:
            print(" ".join(['#' if cell else '.' for cell in row]))
        print("\n")

    def get_neighbors(self, r, c):
        count = 0
        for i in range(-1, 2):
            for j in range(-1, 2):
                if i == 0 and j == 0: continue
                nr, nc = r + i, c + j
                if 0 <= nr < self.rows and 0 <= nc < self.cols:
                    count += self.grid[nr][nc]
        return count

    def next_generation(self):
        new_grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        for r in range(self.rows):
            for c in range(self.cols):
                neighbors = self.get_neighbors(r, c)
                if self.grid[r][c] == 1:
                    if neighbors in [2, 3]: new_grid[r][c] = 1
                else:
                    if neighbors == 3: new_grid[r][c] = 1
        self.grid = new_grid

# Run a small simulation
game = GameOfLife(5, 5)
game.display()
game.next_generation()
game.display()