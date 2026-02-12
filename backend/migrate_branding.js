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
        console.log('Creating SYSTEM_SETTINGS table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS SYSTEM_SETTINGS (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('Seeding default branding values...');
        const defaults = [
            ['library_name', 'Animated Minimalist Library'],
            ['library_logo', ''] // Empty string for default icon
        ];

        for (const [key, value] of defaults) {
            await connection.query(
                'INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
                [key, value]
            );
        }

        console.log('✅ Branding migration complete');
    } catch (error) {
        console.error('❌ Branding migration failed:', error);
    } finally {
        await connection.end();
    }
}

run();
