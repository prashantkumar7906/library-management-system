const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Prashantkumar@1010',
    database: process.env.DB_NAME || 'library_db'
};

async function checkBooks() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT book_id, title, status FROM BOOKS');
        console.log('Total books in database:', rows.length);
        console.log('Book list (first 20):');
        rows.slice(0, 20).forEach(b => console.log(`ID: ${b.book_id} | Status: ${b.status} | Title: ${b.title}`));
    } catch (error) {
        console.error('Error checking books:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkBooks();
