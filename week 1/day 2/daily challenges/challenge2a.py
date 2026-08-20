from datetime import datetime

birthdate_str = input("Enter your birthday (DD/MM/YYYY): ")
birthdate = datetime.strptime(birthdate_str, "%d/%m/%Y")
current_year = datetime.now().year
age = current_year - birthdate.year

# Get the last digit of the age for the candles
num_candles = age % 10
candles = "i" * num_candles

cake = f"""
       {candles.center(11)}
      |:H:A:P:P:Y:|
    __|___________|__
   |^^^^^^^^^^^^^^^^^|
   |:B:i:r:t:h:d:a:y:|
   |                 |
   ~~~~~~~~~~~~~~~~~~~
"""
print(cake)

# Bonus: If leap year, show two cakes!
if birthdate.year % 4 == 0:
    print(cake)