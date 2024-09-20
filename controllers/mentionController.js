  // controllers/mentionController.js
const { Client } = require('pg');

// Database configurations
const usersDbConfig = require('../config/db').usersDbConfig;
const mentionsDbConfig = require('../config/db').mentionsDbConfig;
  
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
async function addMention(req) {
  const contactName = req.body.contact;
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
      'INSERT INTO Mentions (user_id, mention_date) VALUES ($1, $2) RETURNING *',
      [userId, mentionDate]
    );
    await client.end();

    console.log(`Mention added for user ${contactName} with user_id ${userId} on date ${mentionDate}`);
  } catch (err) {
    console.error('Error adding mention:', err);
    await client.end();
  }
}

async function getOrderedContacts() {
  const client = new Client(usersDbConfig);
  try {
    await client.connect();

    const query = `
      SELECT u.id, u.name, MAX(m.mention_date) AS last_mention_date
      FROM Users u
      LEFT JOIN Mentions m ON u.id = m.user_id
      GROUP BY u.id, u.name
      ORDER BY last_mention_date DESC NULLS LAST;
    `;
    const res = await client.query(query);
    await client.end();

    return res.rows; // Returns ordered list of contacts
  } catch (err) {
    console.error('Error executing query', err.stack);
    await client.end();
    return null;
  }
}

  module.exports = { addMention, getOrderedContacts };