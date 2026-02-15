const { Pool, Client } = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

pool
    .connect()
    .then(client => {
        console.log("✅ PostgreSQL connected successfully");
        client.release()
    })
    .catch(err => {
        console.error("❌ PostgreSQL connection failed");
        console.error(err.message)
        process.exit(1)
    })

module.exports = pool