# Challenge 1: Multiples
num = int(input("Enter number: "))
length = int(input("Enter length: "))
print([num * i for i in range(1, length + 1)])

# Challenge 2: No Consecutive Duplicates
word = input("Enter a word: ")
new_word = ""
for char in word:
    if not new_word or char != new_word[-1]:
        new_word += char
print(new_word)