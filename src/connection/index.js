const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'devsql',
    password: 'satuduatiga',
    host: 'db4free.net',
    database: 'task_mysql',
    port: 3306
})

module.exports = conn