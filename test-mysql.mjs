import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.local' });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306', 10)
    });
    
    console.log('✅ Connected successfully to MySQL database!');
    console.log('Database:', process.env.DB_NAME);
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.log('\nTIP: "DB_HOST=MySQL" might fail if you don\'t have a host named "MySQL". Try changing it to "localhost" or "127.0.0.1" in your .env.local file if you are using XAMPP/WAMP/MAMP.');
    }
  }
}

testConnection();
