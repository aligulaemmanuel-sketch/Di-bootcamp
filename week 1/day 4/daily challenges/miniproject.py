menu = {
    "Espresso": 2.50,
    "Latte": 3.50,
    "Cappuccino": 3.00
}

def add_item():
    name = input("Enter item name: ")
    price = float(input("Enter price: "))
    menu[name] = price
    print(f"{name} added to menu.")

def show_menu():
    print("\n--- Current Menu ---")
    for item, price in menu.items():
        print(f"{item}: ${price:.2f}")

def update_price():
    name = input("Which item price to update? ")
    if name in menu:
        new_price = float(input("Enter new price: "))
        menu[name] = new_price
    else:
        print("Item not found.")

def delete_item():
    name = input("Enter item to remove: ")
    menu.pop(name, None)
    print(f"{name} removed.")

# Main Loop
while True:
    choice = input("\n1. View 2. Add 3. Update 4. Delete 5. Exit: ")
    if choice == "1": show_menu()
    elif choice == "2": add_item()
    elif choice == "3": update_price()
    elif choice == "4": delete_item()
    elif choice == "5": break