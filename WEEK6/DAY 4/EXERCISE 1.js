const products = [
    { name: "Laptop", price: 1200, category: "Electronics" },
    { name: "Coffee Maker", price: 80, category: "Appliances" },
    { name: "Desk Chair", price: 150, category: "Furniture" }
];

module.exports = products;
const products = require('./products');

function findProduct(productName) {
    const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (product) {
        console.log(`Found: ${product.name} - $${product.price} (${product.category})`);
    } else {
        console.log("Product not found.");
    }
}

findProduct("Laptop");
findProduct("Desk Chair");
