const mysql = require('mysql2/promise');
require('dotenv').config();

const checkAdmin = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute("SELECT email, role FROM USERS WHERE email = 'libadmin@library.com'");
        console.log('User Role Check:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error checking admin role:', error);
    } finally {
        await connection.end();
    }
};

checkAdmin();
