const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

module.exports = { add, multiply };
const _ = require('lodash');
const math = require('./math');

const sum = math.add(10, 5);
const product = math.multiply(10, 5);
const randomNum = _.random(1, 100);

console.log(`Sum: ${sum}, Product: ${product}`);
console.log(`Random number from lodash: ${randomNum}`);
