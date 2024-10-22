// config/db.js
module.exports = {
  usersDbConfig: {
    user: 'wuhrmann',           // Replace with your PostgreSQL username
    host: 'localhost',              // PostgreSQL server address
    database: 'users_db',           // name of your users database
    password: 'wuhrmann',   // Replace with your PostgreSQL password
    port: 5432                      // default PostgreSQL port
  },
  mentionsDbConfig: {
    user: 'wuhrmann',           // Replace with your PostgreSQL username
    host: 'localhost',              // PostgreSQL server address
    database: 'users_db',        // name of your mentions database
    password: 'wuhrmann',   // Replace with your PostgreSQL password
    port: 5432 
  }, // default PostgreSQL port
  statsDbConfig: {
    user: 'wuhrmann',           // Replace with your PostgreSQL username
    host: 'localhost',              // PostgreSQL server address
    database: 'users_db',        // name of your mentions database
    password: 'wuhrmann',   // Replace with your PostgreSQL password
    port: 5432 
  }// default PostgreSQL port
};
  