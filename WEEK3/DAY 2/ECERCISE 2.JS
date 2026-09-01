const stock = { "banana": 6, "apple": 0, "pear": 12, "orange": 32, "blueberry":1 };
const prices = { "banana": 4, "apple": 2, "pear": 1, "orange": 1.5, "blueberry":10 };

const shoppingList = ["banana", "orange", "apple"];

function myBill() {
    let total = 0;
    for (const item of shoppingList) {
        // Check if item exists in stock and quantity > 0
        if (item in stock && stock[item] > 0) {
            total += prices[item];
            stock[item] -= 1; // Bonus: Decrease stock
        }
    }
    return total;
}

console.log("Total Bill:", myBill());