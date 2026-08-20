const colors = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];
const ordinal = ["th", "st", "nd", "rd"];

colors.forEach((color, index) => {
    let i = index + 1;
    // Ternary to pick the right suffix
    let suffix = (i === 1) ? ordinal[1] : (i === 2) ? ordinal[2] : (i === 3) ? ordinal[3] : ordinal[0];
    console.log(`${i}${suffix} choice is ${color}`);
});

// Check if "Violet" exists
const includesViolet = colors.some(val => val === "Violet");
console.log(includesViolet);