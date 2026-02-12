const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_db',
};

async function run() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('Running USERS update...');
        try {
            await connection.query(`ALTER TABLE USERS ADD COLUMN time_slot VARCHAR(50) DEFAULT NULL AFTER batch`);
            console.log('Column time_slot added.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('Column time_slot already exists.');
            else throw e;
        }

        console.log('Running REQUESTS type update...');
        await connection.query(`ALTER TABLE REQUESTS MODIFY COLUMN type ENUM('BOOK_REQUEST', 'SUBSCRIPTION_EXTENSION', 'PENALTY_WAIVER', 'MEMBERSHIP_REGISTRATION', 'BATCH_CHANGE', 'OTHER') NOT NULL`);
        console.log('REQUESTS type enum updated.');

        console.log('Adding details column to REQUESTS...');
        try {
            await connection.query(`ALTER TABLE REQUESTS ADD COLUMN details JSON DEFAULT NULL AFTER admin_response`);
            console.log('Column details added to REQUESTS.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('Column details already exists.');
            else throw e;
        }

        console.log('✅ Migration complete');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

run();
