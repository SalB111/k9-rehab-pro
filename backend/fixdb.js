const Database = require('better-sqlite3');
const db = new Database('database.db');
try {
  db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
  console.log('Fixed!');
} catch(e) {
  console.log('Error or already exists:', e.message);
}
db.close();
