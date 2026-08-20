function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}

// Test case
const car = { brand: "Toyota", year: 2022 };
console.log(getProperty(car, "brand")); // Output: Toyota
console.log(getProperty(car, "year"));  // Output: 2022