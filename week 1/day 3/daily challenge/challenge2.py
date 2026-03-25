items_purchase = {
    "Water": "$1",
    "Bread": "$3",
    "TV": "$1,000",
    "Fertilizer": "$20",
    "Apple": "$2"
}
wallet = "$50"

# Clean the wallet string to an integer
wallet_amount = int(wallet.replace("$", "").replace(",", ""))

can_buy = []

for item, price in items_purchase.items():
    # Clean price string
    price_clean = int(price.replace("$", "").replace(",", ""))
    
    if price_clean <= wallet_amount:
        can_buy.append(item)

# Output results
if not can_buy:
    print("Nothing")
else:
    can_buy.sort()
    print(can_buy)