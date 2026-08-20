word = input("Enter a word: ")
letter_indices = {}

for index, letter in enumerate(word):
    if letter not in letter_indices:
        letter_indices[letter] = []
    letter_indices[letter].append(index)

print(letter_indices)

# Example output for 'dodo': {'d': [0, 2], 'o': [1, 3]}