function processValue(value: string | number): string {
    if (typeof value === "number") {
        // Formats number to currency (e.g., $100.00)
        return `$${value.toFixed(2)}`;
    } else {
        // Returns the reversed string
        return value.split("").reverse().join("");
    }
}

// Test cases to verify functionality
console.log(processValue(100));     // Output: $100.00
console.log(processValue("TypeScript")); // Output: tpircSePyT
