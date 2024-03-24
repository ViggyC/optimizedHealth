require("dotenv").config();

//use .ENV for local running
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 4321,
  user: "postgres",
  password: "pass123",
  database: "postgres",
});

module.exports = { pool };
