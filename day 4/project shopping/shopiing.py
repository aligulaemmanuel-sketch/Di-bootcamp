# 1. Data Structure
menu = {
    "espresso": 7.0,
    "latte": 12.0,
    "cappuccino": 10.0
}

# 2. Required Functions

def show_menu(menu_dict):
    """Prints all drinks and prices."""
    if not menu_dict:
        print("\nThe menu is empty.")
    else:
        print("\n--- Current Menu ---")
        for drink, price in menu_dict.items():
            print(f"{drink.capitalize()} - {price}M")

def add_item(menu_dict):
    """Adds a new drink to the menu."""
    drink_name = input("Enter new drink name: ").lower()
    if drink_name in menu_dict:
        print(f"Item '{drink_name}' already exists!")
    else:
        try:
            price = float(input("Enter price: "))
            menu_dict[drink_name] = price
            print(f"'{drink_name}' added!")
        except ValueError:
            print("Invalid price. Please enter a number.")

def update_price(menu_dict):
    """Changes the price of an existing drink."""
    drink_name = input("Which drink do you want to update? ").lower()
    if drink_name in menu_dict:
        try:
            new_price = float(input("Enter the new price: "))
            menu_dict[drink_name] = new_price
            print("Price updated!")
        except ValueError:
            print("Invalid price.")
    else:
        print("Item not found.")

def delete_item(menu_dict):
    """Removes a drink from the menu."""
    drink_name = input("Which drink do you want to delete? ").lower()
    if menu_dict.pop(drink_name, None):
        print("Item deleted!")
    else:
        print("Item not found.")

def show_options():
    """Prints the main menu of actions."""
    print("\nWhat would you like to do?")
    print("1. Show menu")
    print("2. Add item")
    print("3. Update price")
    print("4. Delete item")
    print("5. Exit")

# 3. Main Program Loop

def run_coffee_shop():
    while True:
        show_options()
        choice = input("Select an option (1-5): ")

        if choice == '1':
            show_menu(menu)
        elif choice == '2':
            add_item(menu)
        elif choice == '3':
            update_price(menu)
        elif choice == '4':
            delete_item(menu)
        elif choice == '5':
            print("Goodbye!")
            break
        else:
            print("Invalid choice, try again.")

if __name__ == "__main__":
    run_coffee_shop()