const people = ["Greg", "Mary", "Devon", "James"];

// 1. Remove "Greg"
people.shift();

// 2. Replace "James" to "Jason"
people[people.indexOf("James")] = "Jason";

// 3. Add your name to the end
people.push("Alex");

// 4. Console.log Mary's index
console.log(people.indexOf("Mary")); // 0

// 5. Slice the array (Excluding "Mary" and "Alex")
// After steps above, array is ["Mary", "Devon", "Jason", "Alex"]
const newPeople = people.slice(1, 3); 

// 6. Index of "Foo"
console.log(people.indexOf("Foo")); 
// It returns -1 because "Foo" is not present in the array.

// 7. Variable "last"
let last = people[people.length - 1];
// 1. Iterate and log everyone
for (let person of people) {
    console.log(person);
}

// 2. Exit after logging "Devon"
for (let person of people) {
    console.log(person);
    if (person === "Devon") {
        break;
    }
}