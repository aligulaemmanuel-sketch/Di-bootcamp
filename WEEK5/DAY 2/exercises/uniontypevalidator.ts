function validateUnionType(value: unknown, allowedTypes: string[]): boolean {
    const valueType = typeof value;
    return allowedTypes.includes(valueType);
}

// Demonstration
const val1 = 42;
const val2 = "TS is great";
const allowed = ["string", "boolean"];

console.log(validateUnionType(val1, allowed)); // Output: false
console.log(validateUnionType(val2, allowed)); // Output: true