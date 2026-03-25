# Exercise 1: Favorite Numbers
my_fav_numbers = {7, 13, 21, 42}
my_fav_numbers.add(55)
my_fav_numbers.add(99)
# Removing the last number is tricky with sets because they are unordered, 
# but we can convert to list to pop or remove a specific known value.
my_fav_numbers.remove(99) 

friend_fav_numbers = {10, 20, 30}
our_fav_numbers = my_fav_numbers.union(friend_fav_numbers)

# Exercise 2: Tuple
# Tuples are immutable; you cannot add integers to them once created. 
# You would have to create a new tuple by concatenating.

# Exercise 3: List Manipulation
basket = ["Banana", "Apples", "Oranges", "Blueberries"]
basket.remove("Banana")
basket.remove("Blueberries")
basket.append("Kiwi")
basket.insert(0, "Apples")
apple_count = basket.count("Apples")
basket.clear()
print(f"Final basket: {basket}")

# Exercise 4: Floats
# A float is a number with a decimal point, whereas an integer is a whole number.
# Generating the sequence 1.5 to 5.0:
sequence = [x * 0.5 for x in range(3, 11)]

# Exercise 5: For Loop
for i in range(1, 21):
    print(i)

for i in range(1, 21):
    if i % 2 == 0:
        print(i)

# Exercise 6: While Loop
my_name = "Emmanuel"
while True:
    user_name = input("Enter your name: ")
    if user_name == my_name:
        print("Success!")
        break

# Exercise 7: Favorite Fruits
fav_fruits = input("Enter your favorite fruits (separated by space): ").split()
chosen_fruit = input("Enter a fruit name: ")
if chosen_fruit in fav_fruits:
    print("You chose one of your favorite fruits! Enjoy!")
else:
    print("You chose a new fruit. I hope you enjoy it!")

# Exercise 8: Pizza Toppings
toppings = []
while True:
    topping = input("Enter a pizza topping (or 'quit'): ")
    if topping == 'quit':
        break
    toppings.append(topping)
    print(f"Adding {topping} to your pizza.")

total_cost = 10 + (len(toppings) * 2.5)
print(f"Toppings: {toppings}, Total price: ${total_cost}")

# Exercise 9: Cinemax Tickets
family_count = int(input("How many people in the family? "))
total_price = 0
for _ in range(family_count):
    age = int(input("Enter age: "))
    if 3 <= age <= 12:
        total_price += 10
    elif age > 12:
        total_price += 15
print(f"Total ticket price: ${total_price}")   