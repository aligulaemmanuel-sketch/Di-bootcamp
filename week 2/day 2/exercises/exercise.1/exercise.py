class Cat:
    def __init__(self, cat_name, cat_age):
        self.name = cat_name
        self.age = cat_age

# Step 1: Create 3 cat objects
cat1 = Cat("Whiskers", 5)
cat2 = Cat("Luna", 3)
cat3 = Cat("Oliver", 7)

# Step 2: Function to find the oldest cat
def find_oldest_cat(*args):
    return max(args, key=lambda cat: cat.age)

# Step 3: Print details
oldest = find_oldest_cat(cat1, cat2, cat3)
print(f"The oldest cat is {oldest.name}, and is {oldest.age} years old.")