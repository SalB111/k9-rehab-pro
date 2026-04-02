const Database = require('better-sqlite3');
const db = new Database('k9rehab.db');
try {
  db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
  console.log('Fixed!');
} catch(e) {
  console.log('Result:', e.message);
}
db.close();
