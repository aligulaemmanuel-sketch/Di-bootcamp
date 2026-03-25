import random

# Starter code word list
wordslist = ['correction', 'childish', 'beach', 'python', 'assertive', 'interference', 'complete']
word = random.choice(wordslist)

# Game Setup
hidden_word = ["_"] * len(word)
guessed_letters = []
lives = 6

# Visual Gallows
stages = [
    """
       --------
       |      |
       |      O
       |     /|\\
       |     / \\
       -
    """,
    """
       --------
       |      |
       |      O
       |     /|\\
       |     / 
       -
    """,
    """
       --------
       |      |
       |      O
       |     /|\\
       |      
       -
    """,
    """
       --------
       |      |
       |      O
       |     /|
       |      
       -
    """,
    """
       --------
       |      |
       |      O
       |      |
       |      
       -
    """,
    """
       --------
       |      |
       |      O
       |    
       |      
       -
    """,
    """
       --------
       |      |
       |      
       |    
       |      
       -
    """
]

print("Welcome to Hangman!")

# Main Game Loop
while lives > 0 and "_" in hidden_word:
    print(stages[lives])
    print(f"Word: {' '.join(hidden_word)}")
    print(f"Guessed letters: {', '.join(guessed_letters)}")
    print(f"Lives remaining: {lives}")
    
    guess = input("Guess a letter: ").lower()

    # Validation: Check if single letter and not already guessed
    if len(guess) != 1 or not guess.isalpha():
        print("--- Please enter a single valid letter. ---")
        continue
    
    if guess in guessed_letters:
        print(f"--- You already guessed '{guess}'. Try a different one. ---")
        continue

    guessed_letters.append(guess)

    # Check if guess is in the word
    if guess in word:
        print(f"Yes! '{guess}' is in the word.")
        for index, letter in enumerate(word):
            if letter == guess:
                hidden_word[index] = guess
    else:
        lives -= 1
        print(f"No, '{guess}' is not there.")

# End of Game Logic
if "_" not in hidden_word:
    print(f"\nCongratulations! You guessed the word: {word}")
else:
    print(stages[0])
    print(f"\nGame Over. The man has been hanged. The word was: {word}")