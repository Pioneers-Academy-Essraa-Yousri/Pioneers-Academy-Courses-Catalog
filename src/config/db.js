const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../../db.json');

// Helper to migrate existing plain-text passwords to bcrypt
async function migratePasswords(db) {
  let migrated = false;
  if (db.users) {
    for (let user of db.users) {
      if (!user.password.startsWith('$2')) { // bcrypt hashes start with $2a$ or $2b$
        user.password = await bcrypt.hash(user.password, 10);
        migrated = true;
      }
    }
  }
  if (migrated) {
    await writeDB(db);
  }
  return db;
}

async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    
    if (!db.users || db.users.length === 0) {
      const hashedAdminPassword = await bcrypt.hash('admin', 10);
      db.users = [{ username: 'admin', password: hashedAdminPassword, role: 'admin' }];
      await writeDB(db);
    } else {
      await migratePasswords(db);
    }
    return db;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Return default schema if database doesn't exist
      const hashedAdminPassword = await bcrypt.hash('admin', 10);
      const defaultDb = {
        categories: [],
        courses: [],
        users: [{ username: 'admin', password: hashedAdminPassword, role: 'admin' }]
      };
      await writeDB(defaultDb);
      return defaultDb;
    }
    throw err;
  }
}

async function writeDB(data) {
  // We use a temporary file to prevent corruption on crash
  const tempFile = `${DB_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempFile, DB_FILE);
}

module.exports = {
  readDB,
  writeDB
};
