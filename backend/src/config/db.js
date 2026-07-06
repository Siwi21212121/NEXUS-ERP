const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// console.log("USER:", process.env.DB_USER);
// console.log("PASS:", process.env.DB_PASSWORD);
// console.log("DB:", process.env.DB_NAME);
module.exports = pool;