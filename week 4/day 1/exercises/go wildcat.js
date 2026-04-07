const gameInfo = [
 { username: "john", team: "red", score: 5, items: ["ball", "book", "pen"] },
 { username: "becky", team: "blue", score: 10, items: ["tape", "backpack", "pen"] },
 // ... rest of data
];

// 1. Create array of usernames with "!"
const usernames = [];
gameInfo.forEach(user => usernames.push(user.username + "!"));

// 2. Filter winners (score > 5)
const winners = gameInfo
    .filter(user => user.score > 5)
    .map(user => user.username);

// 3. Find total score
const totalScore = gameInfo.reduce((acc, user) => acc + user.score, 0);

console.log(usernames);
console.log(winners);
console.log(totalScore);
console.log(gameInfo);