const mysql = require('mysql2/promise');
require('dotenv').config();

const checkSchema = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute("DESCRIBE AUDIT_LOGS");
        console.log('AUDIT_LOGS Schema:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await connection.end();
    }
};

checkSchema();
