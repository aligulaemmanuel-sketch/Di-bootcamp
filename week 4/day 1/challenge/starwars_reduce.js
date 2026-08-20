const epic = ['a', 'long', 'time', 'ago', 'in a', 'galaxy', 'far far', 'away'];

const combinedString = epic.reduce((acc, current) => {
    return acc + " " + current;
});
console.log(combinedString);