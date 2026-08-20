const users = [
    { firstName: 'Bradley', lastName: 'Bouley', role: 'Full Stack Resident' },
    { firstName: 'Chloe', lastName: 'Alnaji', role: 'Full Stack Resident' },
    { firstName: 'Jonathan', lastName: 'Baughn', role: 'Enterprise Instructor' },
    // ... rest of the data
];

// 1. Map usernames
const welcomeStudents = users.map(user => `Hello ${user.firstName}`);

// 2. Filter for Full Stack Residents
const fullStackResidents = users.filter(user => user.role === 'Full Stack Resident');

// 3. Bonus: Get last names of Full Stack Residents
const lastNames = users
    .filter(user => user.role === 'Full Stack Resident')
    .map(user => user.lastName);

console.log(welcomeStudents);
console.log(fullStackResidents);
console.log(lastNames);