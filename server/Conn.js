const mysql = require('mysql');

const Conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'strikealight'
});

Conn.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  }
  console.log('✅ Database connected');
});

module.exports = Conn;
