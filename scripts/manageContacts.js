const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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


// Connection parameters for users_db
const usersDbConfig = {
  user: 'wuhrmann',           // Replace with your PostgreSQL username
  host: 'localhost',              // PostgreSQL server address
  database: 'users_db',           // name of your users database
  password: 'wuhrmann',   // Replace with your PostgreSQL password
  port: 5432                      // default PostgreSQL port
};

// Connection parameters for mentions_db
const mentionsDbConfig = {
  user: 'wuhrmann',           // Replace with your PostgreSQL username
  host: 'localhost',              // PostgreSQL server address
  database: 'mentions_db',        // name of your mentions database
  password: 'wuhrmann',   // Replace with your PostgreSQL password
  port: 5432                      // default PostgreSQL port
};

// Function to get user ID from users_db based on the contact name
async function getUserId(contactName) {
  const client = new Client(usersDbConfig);

  try {
    await client.connect();
    const res = await client.query('SELECT id FROM Users WHERE name = $1', [contactName]);
    await client.end();

    if (res.rows.length === 0) {
      console.error(`No user found with name: ${contactName}`);
      return null;
    }

    return res.rows[0].id;
  } catch (err) {
    console.error('Error fetching user ID:', err);
    await client.end();
    return null;
  }
}

// Function to add a mention in mentions_db for the user
async function addMention(contactName) {
  const userId = await getUserId(contactName);

  if (!userId) {
    console.error(`Cannot add mention, user ${contactName} not found.`);
    return;
  }

  const client = new Client(mentionsDbConfig);
  const mentionDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format



  try {
    await client.connect();
    const res = await client.query(
      'INSERT INTO UserMentions (user_id, mention_date) VALUES ($1, $2) RETURNING *',
      [userId, mentionDate]
    );
    await client.end();

    console.log(`Mention added for user ${contactName} with user_id ${userId} on date ${mentionDate}`);
  } catch (err) {
    console.error('Error adding mention:', err);
    await client.end();
  }
}

const contactName = 'Maman.md';
addMention(contactName);
