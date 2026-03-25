# Step 1: Representing the Game Board
def create_board():
    # Creating a 3x3 grid using a 2D list
    return [[" " for _ in range(3)] for _ in range(3)]

# Step 2: Displaying the Game Board
def display_board(board):
    print("\nTIC TAC TOE")
    print("*" * 13)
    for row in board:
        print(f"| {' | '.join(row)} |")
        print("-" * 13)

# Step 3: Getting Player Input
def player_input(player, board):
    while True:
        try:
            print(f"Player {player}'s turn...")
            row = int(input("Enter row (1-3): ")) - 1
            col = int(input("Enter column (1-3): ")) - 1
            
            if 0 <= row <= 2 and 0 <= col <= 2:
                if board[row][col] == " ":
                    return row, col
                else:
                    print("That cell is already full! Try again.")
            else:
                print("Invalid input. Enter numbers between 1 and 3.")
        except ValueError:
            print("Please enter valid numbers.")

# Step 4: Checking for a Winner
def check_win(board, player):
    # Check rows, columns, and diagonals
    for i in range(3):
        if all(board[i][j] == player for j in range(3)): return True
        if all(board[j][i] == player for j in range(3)): return True
        
    if all(board[i][i] == player for i in range(3)): return True
    if all(board[i][2-i] == player for i in range(3)): return True
    
    return False

# Step 5: Checking for a Tie
def check_tie(board):
    return all(cell != " " for row in board for cell in row)

# Step 6: The Main Game Loop
def play():
    board = create_board()
    current_player = "X"
    
    print("Welcome to TIC TAC TOE!")
    
    while True:
        display_board(board)
        row, col = player_input(current_player, board)
        board[row][col] = current_player
        
        if check_win(board, current_player):
            display_board(board)
            print(f"Congratulations! Player {current_player} wins!")
            break
            
        if check_tie(board):
            display_board(board)
            print("It's a tie!")
            break
            
        # Switch players
        current_player = "O" if current_player == "X" else "X"

if __name__ == "__main__":
    play()