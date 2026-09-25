const fs = require('fs');

fs.readFile('source.txt', 'utf8', (err, data) => {
    if (err) throw err;
    fs.writeFile('destination.txt', data, (err) => {
        if (err) throw err;
        console.log('File copied successfully!');
    });
});
const fs = require('fs');

fs.readdir('.', (err, files) => {
    if (err) throw err;
    console.log('Files in directory:');
    files.forEach(file => console.log(file));
});
