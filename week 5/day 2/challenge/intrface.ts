interface HasNumericProperty {
    [key: string]: number; 
}

function multiplyProperty<T extends HasNumericProperty, K extends keyof T>(
    obj: T, 
    key: K, 
    factor: number
): number {
    return obj[key] * factor;
}

// Test case
const stats: HasNumericProperty = { score: 10, level: 2 };
console.log(multiplyProperty(stats, "score", 5)); // Output: 50