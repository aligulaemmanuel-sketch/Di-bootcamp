class Cat:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# 1. Instantiate three Cat objects
cat1 = Cat("Whiskers", 3)
cat2 = Cat("Luna", 7)
cat3 = Cat("Oliver", 5)

# 2. Function to find the oldest cat
def get_oldest_cat(*cats):
    oldest = cats[0]
    for cat in cats:
        if cat.age > oldest.age:
            oldest = cat
    return oldest

# 3. Print the result
oldest_cat = get_oldest_cat(cat1, cat2, cat3)
print(f"The oldest cat is {oldest_cat.name}, and is {oldest_cat.age} years old.")