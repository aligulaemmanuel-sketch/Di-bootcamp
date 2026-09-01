let maxStars = 6;

for (let i = 1; i <= maxStars; i++) {
    console.log("* ".repeat(i));
}
let rows = 6;

for (let i = 1; i <= rows; i++) {
    let rowContent = "";
    
    // Inner loop adds a star for every count up to the current row number
    for (let j = 1; j <= i; j++) {
        rowContent += "* ";
    }
    
    console.log(rowContent);
}