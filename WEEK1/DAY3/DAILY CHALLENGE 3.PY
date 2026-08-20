# --- CHALLENGE 1: Letter Index Dictionary ---
print("--- Challenge 1: Letter Indices ---")

# 1. User Input
word = input("Enter a word: ")
letter_indices = {}

# 2. Creating the Dictionary
# We use enumerate() to get both the index (i) and the character (char)
for i, char in enumerate(word):
    # Check if character is already a key
    if char in letter_indices:
        letter_indices[char].append(i)
    else:
        # Create a new key-value pair with the index in a list
        letter_indices[char] = [i]


# 3. Output
print(f"Result for '{word}': {letter_indices}\n")


# --- CHALLENGE 2: Affordable Items ---
print("--- Challenge 2: Wallet & Shopping Basket ---")

# Data Setup (You can swap these dictionaries with the other examples)
items_purchase = {
    "Water": "$1", 
    "Bread": "$3", 
    "TV": "$1,000", 
    "Fertilizer": "$20"
}
wallet_str = "$300"

# 1 & 2. Data Cleaning Function
def clean_price(price_string):
    # Remove $ and , then convert to integer
    clean = price_string.replace("$", "").replace(",", "")
    return int(clean)

wallet = clean_price(wallet_str)
basket = []

# 3. Determining Affordable Items
# We iterate in order of the dictionary (priority)
for item, price_raw in items_purchase.items():
    item_price = clean_price(price_raw)
    
    if wallet >= item_price:
        basket.append(item)
        wallet -= item_price # Update the wallet balance

# 4. Final Logic and Output
if not basket:
    print("Nothing")
else:
    # Print the basket sorted alphabetically
    print(f"Items bought: {sorted(basket)}")