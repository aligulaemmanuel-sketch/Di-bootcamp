// Exercise 1: Scope and variable behavior

// #1
let a = 5;
if (a > 1) {
  a = 3;
}
console.log('#1 ->', a); // Expected: 3

try {
  const b = 5;
  b = 3; // This will fail because const cannot be reassigned
} catch (error) {
  console.log('#1.2 -> const reassignment error');
}

// #2
let globalA = 0;

function funcTwo() {
  console.log('#2.1 first ->', globalA); // Expected: 0
  globalA = 5;
}

funcTwo();
console.log('#2.1 second ->', globalA); // Expected: 5

try {
  const c = 10;
  c = 20; // This will fail because const cannot be reassigned
} catch (error) {
  console.log('#2.2 -> const reassignment error');
}

// #3
function funcFour() {
  globalThis.a = 'hello';
}

function funcFive() {
  console.log('#3.1 ->', globalThis.a); // Expected: hello
}

funcFour();
funcFive();

// #4
let outerA = 'global';

function funcSix() {
  const a = 'test';
  console.log('#4.1 ->', a); // Expected: test
}

funcSix();
console.log('#4.2 ->', outerA); // Expected: global

// #5
let blockA = 2;

if (true) {
  let blockA = 5;
  console.log('#5.1 ->', blockA); // Expected: 5
}

console.log('#5.2 ->', blockA); // Expected: 2

// const also follows block scope
if (true) {
  const nestedConst = 5;
  console.log('#5.3 ->', nestedConst); // Expected: 5
}
