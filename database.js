require('dotenv').config();

const mysql = require('promise-mysql');

const createTcpPool = async config => {
    const dbConfig = {
        host: process.env.INSTANCE_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    };

    return mysql.createPool(dbConfig);
}

module.exports = createTcpPool;