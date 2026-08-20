import random


class Game:
    def get_user_item(self):
        while True:
            user_input = input("Select an item (rock/paper/scissors): ").strip().lower()
            if user_input in ["rock", "paper", "scissors"]:
                return user_input
            print("Invalid input. Please try again.")

    def get_computer_item(self):
        return random.choice(["rock", "paper", "scissors"])

    def get_game_result(self, user_item, computer_item):
        if user_item == computer_item:
            return "draw"

        win_conditions = {
            "rock": "scissors",
            "paper": "rock",
            "scissors": "paper"
        }

        if win_conditions[user_item] == computer_item:
            return "win"
        return "loss"

    def play(self):
        user = self.get_user_item()
        computer = self.get_computer_item()
        result = self.get_game_result(user, computer)

        print(f"You chose {user}, computer chose {computer}. Result: {result}")
        return result


def play_series(best_of=3):
    game = Game()
    scores = {"user": 0, "computer": 0, "draw": 0}
    required = best_of // 2 + 1

    print(f"\nStarting Rock-Paper-Scissors best of {best_of} (first to {required})")

    while scores["user"] < required and scores["computer"] < required:
        result = game.play()
        if result == "win":
            scores["user"] += 1
        elif result == "loss":
            scores["computer"] += 1
        else:
            scores["draw"] += 1

        print(f"Score -> You: {scores['user']}  Computer: {scores['computer']}  Draws: {scores['draw']}")

    winner = "You" if scores["user"] > scores["computer"] else "Computer"
    print(f"Game over! {winner} wins the series.")
    return winner


if __name__ == '__main__':
    while True:
        try:
            best_of = int(input("Enter best-of rounds (3, 5, 7 recommended): ").strip())
            if best_of > 0 and best_of % 2 == 1:
                break
            print("Must be a positive odd number.")
        except ValueError:
            print("Please enter a valid number.")

    play_series(best_of)
