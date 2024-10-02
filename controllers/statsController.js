const { Client } = require('pg');

// Database configuration (you might already have this)
const statsDbConfig = require('../config/db').statsDbConfig;  // Assuming you have this in your db config
const usersDbConfig = require('../config/db').usersDbConfig;  // To fetch user info if needed

// Function to add a stat record into stats_db for the user
async function addStat(req) {

    const client = new Client(statsDbConfig);

    const { interaction_type, interaction_value, button_id, start_time, end_time, duration } = req.body;
    const statDate = new Date().toISOString();  // Timestamp of the interaction
    
    try {
      await client.connect();
      const res = await client.query(
        'INSERT INTO Stats (interaction_type, interaction_value, button_id, interaction_date, start_time, end_time, duration) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [interaction_type, interaction_value, button_id, statDate, start_time, end_time, duration]
      );
      await client.end();
  
      console.log(`Stat  of type ${interaction_type} and value ${interaction_value} added with duration ${duration}, start_time ${start_time}, and end_time ${end_time}`);
    } catch (err) {
      console.error('Error adding stat:', err);
      await client.end();
    }
}

// Function to retrieve all stats (optional)
async function getAllStats(req, res) {
  const client = new Client(statsDbConfig);
  let res2 = [];
  try {
    await client.connect();
    res2 = await client.query('SELECT * FROM Stats ORDER BY interaction_date DESC');
    await client.end();

    // return res.rows;  // Returns all the stats recorded in the system
  } catch (err) {
    console.error('Error retrieving stats:', err);
    await client.end();
  }
  res.json(res2);
}

module.exports = { addStat, getAllStats };
