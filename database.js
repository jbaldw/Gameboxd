require('dotenv').config();

const mysql = require('promise-mysql');

const createTcpPool = async config => {
    const dbConfig = {
        host: '10.121.80.3',
        user: 'root',
        password: 'hogwarts200',
        database: 'gameboxd_main',
    };

    return mysql.createPool(dbConfig);
}

module.exports = createTcpPool;