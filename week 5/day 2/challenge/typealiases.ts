type AdvancedUser = {
    name: string;
    age: number;
    address?: string; // Optional property
};

function introduceAdvancedUser(user: AdvancedUser): string {
    let message = `Hello, my name is ${user.name} and I am ${user.age} years old.`;
    if (user.address) {
        message += ` I live at ${user.address}.`;
    }
    return message;
}

// Test cases
const user1: AdvancedUser = { name: "Emmanuel", age: 22 };
const user2: AdvancedUser = { name: "Asuva", age: 25, address: "Nairobi, Kenya" };

console.log(introduceAdvancedUser(user1));
console.log(introduceAdvancedUser(user2));