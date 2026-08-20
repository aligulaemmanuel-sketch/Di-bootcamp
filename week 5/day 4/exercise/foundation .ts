// Intersection
type Person = { name: string; age: number };
type Address = { street: string; city: string };
type PersonWithAddress = Person & Address;

// Type Guard
function describeValue(value: number | string): string {
  if (typeof value === "number") return "This is a number";
  if (typeof value === "string") return "This is a string";
  return "Unknown type";
}

// Generic Constraint
function logLength<T extends { length: number }>(arg: T): void {
  console.log(arg.length);
}