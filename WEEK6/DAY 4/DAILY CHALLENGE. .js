/**
 * DAILY CHALLENGE: INTEGRATED NODE.JS SCRIPT
 * This file combines Task 1 (Modules), Task 2 (NPM/Chalk), 
 * and Task 3 (File Operations).
 */

const fs = require('fs');
const path = require('path');

// NOTE: This requires 'npm install chalk@4' to be run in your terminal first.
// If you don't have chalk installed, you can comment out the chalk lines.
let chalk;
try {
    chalk = require('chalk');
} catch (e) {
    console.log("(Note: Chalk not installed. Text will appear without color.)\n");
}

// --- TASK 1: GREETING LOGIC ---
function greet(name) {
    return `Hello, ${name}! Welcome to the Node.js world.`;
}

// --- TASK 2: COLORFUL MESSAGE LOGIC ---
function displayColorMessage() {
    if (chalk) {
        const message = chalk.blue.bold('This is a vibrant blue message!') + 
                        ' ' + chalk.red.underline('And this is urgent red.');
        console.log(message);
    } else {
        console.log('This is a message (install chalk to see it in color).');
    }
}

// --- TASK 3: FILE OPERATION LOGIC ---
function readFileContent() {
    const dirPath = path.join(__dirname, 'files');
    const filePath = path.join(dirPath, 'file-data.txt');

    // Ensure directory and file exist for the demo
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Node.js is powerful for file management!', 'utf8');
    }

    // Read and display the content
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        console.log('--- File Content ---');
        console.log(data);
        console.log('--------------------');
    });
}

// --- EXECUTION: INTEGRATING EVERYTHING ---
function runChallenge() {
    console.log('--- Task 1: Greeting ---');
    console.log(greet('Challenger'));
    console.log('');

    console.log('--- Task 2: NPM Module (Chalk) ---');
    displayColorMessage();
    console.log('');

    console.log('--- Task 3: File Operations ---');
    readFileContent();
}

runChallenge();