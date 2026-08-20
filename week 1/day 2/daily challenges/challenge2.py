user_word = input("Enter a word with duplicate letters: ")
result = ""

for char in user_word:
    if len(result) == 0 or char != result[-1]:
        result += char

print(result) # Example: "ppooeeemmm" -> "poem"