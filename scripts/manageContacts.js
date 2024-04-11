const fs = require('fs');
const path = require('path');

const contactsDir = 'vault/contacts';

// Asynchronously read directory contents

console.log("Current working directory:", process.cwd());

fs.readdir(contactsDir, (err, files) => {
  if (err) {
    console.error("Error reading directory", err);
    return;
  }
  console.log("Files in contacts directory:", files);
});

// Synchronously read a specific file
const readContact = (filename) => {
  const filePath = path.join(contactsDir, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error("Error reading file", err);
  }
};

// Example usage: readContact('example.md');
module.exports = { readContact };