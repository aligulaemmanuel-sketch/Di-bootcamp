interface Calculator {
  (a: number, b: number): number; // Function type
}

const add: Calculator = (x, y) => x + y;
const subtract: Calculator = (x, y) => x - y;

console.log(add(10, 5));      // 15
console.log(subtract(10, 5)); // 5