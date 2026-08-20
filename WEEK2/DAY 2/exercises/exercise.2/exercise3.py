class MenuManager:
    def __init__(self):
        # Initial menu structure
        self.menu = {
            "Soup": {"price": 10, "spice": "B", "gluten": False},
            "Hamburger": {"price": 15, "spice": "A", "gluten": True},
            "Salad": {"price": 18, "spice": "A", "gluten": False},
            "French Fries": {"price": 5, "spice": "C", "gluten": False},
            "Beef Bourguignon": {"price": 25, "spice": "B", "gluten": True}
        }

    def add_item(self, name, price, spice, gluten):
        self.menu[name] = {"price": price, "spice": spice, "gluten": gluten}
        print(f"{name} added to the menu.")

    def update_item(self, name, price, spice, gluten):
        if name in self.menu:
            self.menu[name] = {"price": price, "spice": spice, "gluten": gluten}
            print(f"{name} updated.")
        else:
            print(f"Error: {name} is not on the menu.")

    def remove_item(self, name):
        if name in self.menu:
            del self.menu[name]
            print(f"{name} removed. Current menu: {list(self.menu.keys())}")
        else:
            print(f"Error: {name} is not on the menu.")

# Example usage
manager = MenuManager()
manager.add_item("Tacos", 12, "C", False)
manager.remove_item("Soup")