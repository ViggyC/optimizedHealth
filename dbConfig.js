require('dotenv').config();

const {Pool} = require('pg');

const isProduction = process.env.NODE_ENV ==='production';

//const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
//port is 5433

// const pool = new Pool({
//     connectionString: process.env.NODE_ENV ==='production' ? process.env.DATABASE_URL : connectionString
// });

const connectionString= 'postgres://gpdaahccetqiqx:aa837e8b9ca07e3da45e94b09d6be62429edeab5e26558169deb8a09b0c2d35f@ec2-107-22-245-82.compute-1.amazonaws.com:5432/d6cp7nh1laguuu'

const pool= new Pool({
    connectionString: connectionString
})

console.log("connection string: " + connectionString);
console.log("is production: " + isProduction);
console.log("pool string: " + pool.connectionString);
module.exports = {pool};

//the USER is optimizedhealth
//the database name is nodelogin
//the table in the database is called 'users'