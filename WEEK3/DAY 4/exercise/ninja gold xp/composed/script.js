const compose = (f, g) => (a) => f(g(a));

const add1 = (num) => num + 1;
const add5 = (num) => num + 5;

// Calculation: add5(10) = 15, then add1(15) = 16
console.log(compose(add1, add5)(10));