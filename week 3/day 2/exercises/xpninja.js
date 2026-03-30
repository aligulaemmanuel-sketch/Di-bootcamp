function isPalindrome(str) {
    // Clean the string: lowercase and remove non-alphanumeric (optional but good practice)
    const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Optimized: Compare characters from outside in
    for (let i = 0; i < cleanStr.length / 2; i++) {
        if (cleanStr[i] !== cleanStr[cleanStr.length - 1 - i]) {
            return false;
        }
    }
    return true;
}

console.log(isPalindrome("Madam")); // true
console.log(isPalindrome("Hello")); // false