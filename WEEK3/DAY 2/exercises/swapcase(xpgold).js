function swapCase(str) {
    if (typeof str !== 'string') return "";

    let result = "";
    for (const char of str) {
        const upper = char.toUpperCase();
        result += (char === upper) ? char.toLowerCase() : upper;
    }
    return result;
}

console.log(swapCase("The Quick Brown Fox")); 
// Result: "tHE qUICK bROWN fOX"