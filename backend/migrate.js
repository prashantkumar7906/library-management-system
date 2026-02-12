const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env if exists for local testing
dotenv.config();

async function runMigration() {
    const config = process.env.MYSQL_PUBLIC_URL ? {
        uri: process.env.MYSQL_PUBLIC_URL,
        multipleStatements: true
    } : {
        host: process.env.MYSQLHOST || process.env.DB_HOST,
        user: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.DB_NAME,
        port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
        multipleStatements: true
    };

    if (process.env.MYSQL_PUBLIC_URL) {
        console.log('Connecting using MYSQL_PUBLIC_URL');
    } else {
        console.log('Connecting to database:', {
            host: config.host,
            user: config.user,
            database: config.database,
            port: config.port
        });
    }

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected successfully.');

        const sqlPath = path.join(__dirname, 'migrations', 'railway_complete_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration...');

        // Split by delimiter if necessary, but multipleStatements: true handles most cases.
        // However, some complex triggers with DELIMITER $$ might need manual splitting.
        // For simplicity, let's try multipleStatements first.

        await connection.query(sql);
        console.log('Migration completed successfully! 🎉');

        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
