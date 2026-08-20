function sumNumbersInArray(arr: (number | string)[]): number {
    let sum = 0;
    arr.forEach(item => {
        if (typeof item === "number") {
            sum += item;
        }
    });
    return sum;
}

// Test case
console.log(sumNumbersInArray([10, "apple", 20, "orange", 5])); // Output: 35