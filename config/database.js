import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.DB_PASS || ''),
    database: process.env.DB_NAME || 'haltea_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
});

/**
 * Execute SQL Query with parameters
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<[Array, Object]>}
 */
export async function query(sql, params = []) {
    return pool.query(sql, params);
}

/**
 * Get a connection for manual transactions
 */
export async function getConnection() {
    return pool.getConnection();
}

export default {
    query,
    getConnection,
    pool
};
