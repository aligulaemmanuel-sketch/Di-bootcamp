// Improved conditional type: returns a number for numeric input, and a string description for others.
type MappedType<T> = T extends number ? number : string; 

function mapType<T extends number | string>(value: T): MappedType<T> {
    if (typeof value === "number") {
        return (value * value) as MappedType<T>; // Square
    } else {
        return `Length is: ${value.length}` as MappedType<T>;
    }
}

// Test cases
console.log(mapType(5));      // Output: 25
console.log(mapType("hello")); // Output: Length is: 5