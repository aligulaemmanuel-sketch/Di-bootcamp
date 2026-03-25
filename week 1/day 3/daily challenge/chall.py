total_cost = 0

while True:
    age_input = input("Enter the age of the person (or 'quit' to finish): ")
    
    if age_input.lower() == 'quit':
        break
        
    age = int(age_input)
    
    if age < 3:
        print("Ticket is free!")
    elif 3 <= age <= 12:
        total_cost += 10
        print("Ticket is $10.")
    else:
        total_cost += 15
        print("Ticket is $15.")

print(f"Your total family cost is: ${total_cost}")