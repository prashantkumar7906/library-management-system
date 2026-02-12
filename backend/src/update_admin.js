const mysql = require('mysql2/promise');
require('dotenv').config();

const updateAdmin = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [result] = await connection.execute("UPDATE USERS SET role = 'ADMIN' WHERE email = 'libadmin@library.com'");
        console.log('Update Result:', result);

        const [rows] = await connection.execute("SELECT email, role FROM USERS WHERE email = 'libadmin@library.com'");
        console.log('Final User Role:', rows);
    } catch (error) {
        console.error('Error updating admin role:', error);
    } finally {
        await connection.end();
    }
};

updateAdmin();
