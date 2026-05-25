import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const port = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
const database = process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.DB_NAME || 'soen287_project';

async function main() {
  const conn = await mysql.createConnection({ host, port, user, password, database });
  try {
    console.log('Connected to DB:', host, 'db:', database);
    const [result] = await conn.execute(
      'INSERT INTO resources (ResName, ResCategory, created_at) VALUES (?, ?, NOW())',
      ['Automated Test Room X - Capacity: 6 - Location: Local Test', 'Study Rooms']
    );
    console.log('Inserted resource, result:', result);
    const [rows] = await conn.execute('SELECT id, ResName, ResCategory FROM resources WHERE id = ?', [result.insertId || result.insert_id || result.insert_rowid || result.lastID]);
    console.log('New resource row:', rows);
  } catch (err) {
    console.error('Failed to insert resource:', err);
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
}

main();
