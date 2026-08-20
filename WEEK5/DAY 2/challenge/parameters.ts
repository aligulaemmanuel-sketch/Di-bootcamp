function welcomeUser(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}

// Test cases
console.log(welcomeUser("Emmanuel"));          // Output: Hello, Emmanuel!
console.log(welcomeUser("Emmanuel", "Welcome")); // Output: Welcome, Emmanuel!