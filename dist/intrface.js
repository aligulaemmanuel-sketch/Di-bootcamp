"use strict";
function multiplyProperty(obj, key, factor) {
    return obj[key] * factor;
}
// Test case
const stats = { score: 10, level: 2 };
console.log(multiplyProperty(stats, "score", 5)); // Output: 50
