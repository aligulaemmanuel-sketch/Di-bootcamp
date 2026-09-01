const names = ["Jack", "Philip", "Sarah", "Amanda", "Bernard", "Kyle"];
let acronym = [];

for (let name of names) {
    acronym.push(name[0]);
}

console.log(acronym.sort().join("")); // Outputs: ABJKPS