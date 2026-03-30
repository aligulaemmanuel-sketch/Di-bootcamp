const people = ["Greg", "Mary", "Devon", "James"];

// 1. Remove "Greg"
people.shift();

// 2. Replace "James" with "Jason"
const jamesIndex = people.indexOf("James");
if (jamesIndex !== -1) {
    people[jamesIndex] = "Jason";
}

// 3. Add your name to the end
people.push("Emmanuel");

// 4. Log Mary's index
console.log(people.indexOf("Mary"));

// 5. Slice (copy) the list excluding Mary or your name
// Assuming "Mary" is at index 0 and your name is last.
const newPeople = people.slice(1, -1);

// 6. Index of "Foo" (returns -1 because it's not found)
console.log(people.indexOf("Foo"));

// 7. Get the last element dynamically
const last = people[people.length - 1];