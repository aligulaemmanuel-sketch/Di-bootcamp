# Create the initial dictionary
brand = {
    "name": "Zara",
    "creation_date": 1975,
    "creator_name": "Amancio Ortega Gaona",
    "global_price": {"France": 20, "Spain": 15, "US": 40},
    "type_of_clothes": ["men", "women", "children", "home"],
    "international_competitors": ["Gap", "H&M", "Benetton"],
    "number_stores": 7000,
    "major_color": {
        "France": "blue", 
        "Spain": "red", 
        "US": "pink"
    }
}

# Change number of stores to 2
brand["number_stores"] = 2

# Print a sentence about the clients
print(f"Zara's clients are {', '.join(brand['type_of_clothes'][:-1])} and {brand['type_of_clothes'][-1]}.")

# Add country creation
brand["country_creation"] = "Spain"

# Check if international_competitors is in the dict, then add Desigual
if "international_competitors" in brand:
    brand["international_competitors"].append("Desigual")

# Delete creation_date
del brand["creation_date"]

# Print the last international competitor
print(f"The last competitor is: {brand['international_competitors'][-1]}")