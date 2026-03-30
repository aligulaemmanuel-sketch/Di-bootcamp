const numbers = [5,0,9,1,7,4,2,6,3,8];

// Nested loops for Bubble Sort
for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length - 1 - i; j++) {
        // Change < to > for ascending order
        if (numbers[j] < numbers[j + 1]) {
            // Temporary variable to swap values
            let temp = numbers[j];
            numbers[j] = numbers[j + 1];
            numbers[j + 1] = temp;
        }
    }
}

console.log(numbers.toString()); 
// Result: 9,8,7,6,5,4,3,2,1,0

