# Exercise 2: What is the Season?
month = int(input("Input a month (1 to 12): "))

if 3 <= month <= 5:
    print("Spring")
elif 6 <= month <= 8:
    print("Summer")
elif 9 <= month <= 11:
    print("Autumn")
elif month == 12 or 1 <= month <= 2:
    print("Winter")