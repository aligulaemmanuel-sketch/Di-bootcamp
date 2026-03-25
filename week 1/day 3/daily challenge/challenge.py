birthdays = {
    "Alice": "1995/05/15",
    "Bob": "1990/10/22",
    "Charlie": "2000/01/01"
}

# 1. Show available names
print("You can look up the birthdays of:", ", ".join(birthdays.keys()))

# 2. Get user input
search_name = input("Whose birthday do you want to know? ")

if search_name in birthdays:
    print(f"{search_name}'s birthday is {birthdays[search_name]}")
else:
    print(f"Sorry, we don't have birthday information for {search_name}")

# 3. Add a new birthday
new_name = input("Add a new name: ")
new_date = input("Add their birthday (YYYY/MM/DD): ")
birthdays[new_name] = new_date
print(f"Updated! {new_name} added.")