# Exercise 1: Add Two Numbers
def add_two_numbers(a, b):
    return a + b


# Exercise 2: Create
def greet(name):
    print(f"Hello, {name}")


# Exercise 3: Check if Number is Even or Odd
def check_even_odd(number):
    if number % 2 == 0:
        return "Even"
    else:
        return "Odd"


# Exercise 4: Sum of Numbers in a List
def sum_list(numbers):
    return sum(numbers)


# Exercise 5: Print Days of the Week
def print_days():
    days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ]
    for day in days:
        print(day)


# Exercise 6: Check if Number is Positive, Negative, or Zero
def check_sign(number):
    if number > 0:
        return "Positive"
    elif number < 0:
        return "Negative"
    else:
        return "Zero"


# Exercise 7: Repeat a Word
def repeat_word(word, count):
    for _ in range(count):
        print(word)


if __name__ == "__main__":
    print("add_two_numbers(3, 5):", add_two_numbers(3, 5))
    greet("Alice")
    print("check_even_odd(7):", check_even_odd(7))
    print("sum_list([1, 2, 3, 4]):", sum_list([1, 2, 3, 4]))
    print("check_sign(-2):", check_sign(-2))
    print("Days of the week:")
    print_days()
    print("repeat_word('Happy', 2):")
    repeat_word("Happy", 2)
