import random

# 1. Ask for user input
user_string = input("Please enter a string of exactly 10 characters: ")

# 2. Check the length
if len(user_string) < 10:
    print("string not long enough")
elif len(user_string) > 10:
    print("string too long")
else:
    print("perfect string")

    # 3. Print first and last characters
    print(f"First character: {user_string[0]}")
    print(f"Last character: {user_string[-1]}")

    # 4. Build the string character by character
    constructed_string = ""
    for char in user_string:
        constructed_string += char
        print(constructed_string)

    # 5. Bonus: Jumble the string
    str_list = list(user_string)
    random.shuffle(str_list)
    print("Jumbled string:", "".join(str_list))