def get_retirement_age(gender):
    if gender == "male":
        return 67
    else:
        return 62

def can_retire(gender, date_of_birth):
    current_year = 2026
    year_of_birth = int(date_of_birth.split("/")[0])
    age = current_year - year_of_birth
    
    retirement_age = get_retirement_age(gender)
    
    if age >= retirement_age:
        return True
    else:
        return False

# Testing
gender = input("Enter gender (male/female): ")
dob = input("Enter DOB (YYYY/MM/DD): ")

if can_retire(gender, dob):
    print("You can retire now!")
else:
    print("You still have some years to go.")