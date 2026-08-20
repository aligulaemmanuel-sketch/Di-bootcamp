const users = { user1: 18273, user2: 92833, user3: 90315 };

// 1. Convert to array
const usersArray = Object.entries(users);
console.log(usersArray);

// 2. Modify outcome: Multiply ID by 2
const modifiedUsers = Object.entries(users).map(([user, id]) => [user, id * 2]);
console.log(modifiedUsers);