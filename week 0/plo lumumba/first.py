# 1. Declare a variable called first and assign it "hello world"
first = "hello world"

# 2. Write a comment
# This is a comment.

# 3. Log a message to the terminal
print("I AM A COMPUTER!")

# 4. If statement logic
if 1 < 2 and 4 > 2:
    print("Math is fun.")

# 5. Assign variable 'nope' to absence of value
nope = None

# 6. Combine true and false with 'and'
result_boolean = True and False

# 7. Length of the string
print(len("what's my length?"))

# 8. Convert to uppercase
print("i am shouting".upper())

# 9. Convert string to number
print(int("1000"))

# 10. Combine number and string
print(str(4) + "real")

# 11. Record output of "3" + "cool"
# The result is "3cool" (String concatenation)

# 12. Record output of 1 / 0
# This will raise a ZeroDivisionError.

# 13. Determine the type of []
print(type([])) # Output: <class 'list'>

# 14-16. Input and string methods
name = input("What is your name? ")
num = int(input("Pick a number: "))
if num < 0:
    print("That number is less than 0!")
elif num > 0:
    print("That number is greater than 0!")
else:
    print("You picked 0.")

# 17-18. Finding and checking strings
print("apple".find("l"))
print("y" in "xylophone")

# 19. Check if string is lowercase
my_string = "hello"
print(my_string.islower())