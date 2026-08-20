let stars = "";
for (let i = 0; i < 6; i++) {
    stars += " * ";
    console.log(stars);
}


for (let i = 1; i <= 6; i++) {
    let row = "";
    for (let j = 1; j <= i; j++) {
        row += " * ";
    }
    console.log(row);
}