let client = "John";
const groceries = {
    fruits: ["pear", "apple", "banana"],
    vegetables: ["tomatoes", "cucumber", "salad"],
    totalPrice: "20$",
    other: {
        paid: true,
        meansOfPayment: ["cash", "creditCard"]
    }
};

// 1. Arrow function to display fruits
const displayFruits = () => {
    groceries.fruits.forEach(fruit => console.log(fruit));
};

// 2. Cloning and testing references
const cloneGroceries = () => {
    let user = client; // Pass by value (String)
    client = "Betty"; // Changing 'client' won't change 'user'
    
    let shopping = groceries; // Pass by reference (Object)
    shopping.totalPrice = "35$"; // This WILL change groceries.totalPrice
    shopping.other.paid = false; // This WILL change groceries.other.paid
    
    console.log("User variable:", user);
    console.log("Groceries object after clone change:", groceries);
};

displayFruits();
cloneGroceries();