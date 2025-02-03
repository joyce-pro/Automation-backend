const pg = require('pg');
pg.defaults.ssl = true

const database = process.env.DATABASE;
const user = process.env.DBUSER;
const host = process.env.HOST;
const password = process.env.PASSWORD;
const dbPort = process.env.DBPORT;

// PostgreSQL connection
const client = new pg.Client({
    user: user,
    host: host,
    database: database,
    password: password,
    port: dbPort,
    ssl: {
        rejectUnauthorized: false, // Disable SSL certificate validation if necessary
    },
});

module.exports = client
