const fs = require('fs');

function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}

function writeFile(path, content) {
    fs.writeFileSync(path, content);
}

module.exports = { readFile, writeFile };
const { readFile, writeFile } = require('./fileManager');

try {
    const content = readFile('Hello World.txt');
    console.log("Read from file:", content);
    
    writeFile('Bye World.txt', 'Writing to the file');
    console.log("Successfully wrote to Bye World.txt");
} catch (err) {
    console.error("Error managing files:", err.message);
}