export const people = [
    { name: "Alice", age: 25, location: "New York" },
    { name: "Bob", age: 30, location: "London" },
    { name: "Charlie", age: 35, location: "Paris" }
];
import { people } from './data.js';

function calculateAverageAge(arr) {
    const totalAge = arr.reduce((sum, person) => sum + person.age, 0);
    const average = totalAge / arr.length;
    console.log(`The average age is: ${average.toFixed(2)}`);
}

calculateAverageAge(people);
