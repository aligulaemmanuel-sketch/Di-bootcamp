# Exercise 1: Cars
car_string = "Toyota, Honda, Mazda, Mitsubishi, Nissan, Subaru"
car_list = car_string.split(", ")

# Count and Sort
print(f"There are {len(car_list)} companies in the list.")
car_list.sort(reverse=True)
print("Reverse Alphabetical:", car_list)

# Find 'o' in name
o_cars = [car for car in car_list if "o" in car.lower()]
print(f"{len(o_cars)} cars have the letter 'o': {o_cars}")
