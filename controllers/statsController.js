const { Client } = require('pg');

// Database configuration (you might already have this)
const statsDbConfig = require('../config/db').statsDbConfig;  // Assuming you have this in your db config

// Function to add a stat record into stats_db for the user
async function addStat(req, res) {

    console.log('called on server :)');

    const client = new Client(statsDbConfig);

    const { interaction_type, interaction_value, button_id, start_time, end_time, duration } = req.body;
    const statDate = new Date().toISOString();  // Timestamp of the interaction
    
    try {
      await client.connect();
      const result = await client.query(
        'INSERT INTO Stats (interaction_type, interaction_value, button_id, interaction_date, start_time, end_time, duration) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [interaction_type, interaction_value, button_id, statDate, start_time, end_time, duration]
      );
      await client.end();
      res.status(200).json({ success: true, data: result.rows[0] });
      console.log(`Stat  of type ${interaction_type} and value ${interaction_value} added with duration ${duration}, start_time ${start_time}, and end_time ${end_time}`);
    } catch (err) {
      console.error('Error adding stat:', err);
      await client.end();
    }
}

// Function to fetch the sum of counter values for today
async function getCounterData(buttonId, client) {
  const query = `
    SELECT SUM(interaction_value) AS total
    FROM Stats
    WHERE button_id = $1
    AND interaction_type = 'counter'
    AND interaction_date >= CURRENT_DATE;
  `;
  
  const res = await client.query(query, [buttonId]);
  return res.rows[0]?.total || 0; // Return the total, or 0 if no data
}

// Function to fetch the last level value
async function getLevelData(buttonId, client) {
  const query = `
    SELECT interaction_value
    FROM Stats
    WHERE button_id = $1
    AND interaction_type = 'level'
    ORDER BY interaction_date DESC
    LIMIT 1;
  `;
  
  const res = await client.query(query, [buttonId]);
  return res.rows[0]?.interaction_value || null; // Return the last value, or null if no data
}

const interactionTypeHandlers = {
  counter: getCounterData,
  level: getLevelData,
  // Add new types here in the future, e.g., 'toggle': getToggleData
};

async function fetchInteractionData(buttonConfigs) {

  const client = new Client(statsDbConfig);
  await client.connect();

  const results = {};
  
  // Loop through each button config and fetch data based on interaction type
  for (const { buttonId, interactionType } of buttonConfigs) {
    const handler = interactionTypeHandlers[interactionType];

    if (handler) {
      const data = await handler(buttonId, client);
      results[buttonId] = { interactionType, data };
    } else {
      console.warn(`No handler found for interaction type: ${interactionType}`);
    }
  }

  await client.end();
  return results;  // Return the gathered data
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

module.exports = { addStat, getAllStats, fetchInteractionData };
