# --- CHALLENGE 1: Multiples of a Number ---
print("--- Challenge 1: Multiples ---")

# 1. Ask the user for two inputs
num = int(input("Enter the number: "))
length = int(input("Enter the desired length of the list: "))

# 2. Generate the list of multiples
multiples = []

# We start the range at 1 and go up to length + 1
for i in range(1, length + 1):
    multiples.append(num * i)

# 3. Print the output
print(f"List of multiples: {multiples}\n")


# --- CHALLENGE 2: Remove ConsecEutive Duplicate Letters ---
print("--- Challenge 2: Remove Consecutive Duplicates ---")

# 1. Ask the user for a string
user_word = input("Enter a word with consecutive duplicate let ters: ")
input("Press Enter to see the modified string...")

# 2. Process the string
# We start with the first character already in our result
if not user_word:
    result = ""
else:
    result = user_word[0]

    # Loop through the string starting from the second character (index 1)
    for i in range(1, len(user_word)):
        # Only add the character if it is NOT the same as the one we just added

        if user_word[i] != user_word[i-1]:
            result += user_word[i]

# 3. Print the modified string
print(f"Modified string: {result}")