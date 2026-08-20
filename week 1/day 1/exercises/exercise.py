user_word = input("Enter a word with duplicate letters: ")
new_string = ""

for char in user_word:
    # If the string is empty or the current character is different from the last added one
    if len(new_string) == 0 or char != new_string[-1]:
        new_string += char

print(f"Output: {new_string}"