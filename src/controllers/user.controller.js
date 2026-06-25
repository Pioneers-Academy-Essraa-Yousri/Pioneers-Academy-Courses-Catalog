const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../config/db');

async function getUsers(req, res, next) {
  try {
    const db = await readDB();
    const safeUsers = db.users.map(u => ({ username: u.username, role: u.role }));
    res.json(safeUsers);
  } catch (err) {
    next(err);
  }
}

async function saveUser(req, res, next) {
  try {
    const { username, password, role } = req.body;
    if (!username || !role) {
      return res.status(400).json({ error: 'اسم المستخدم والصلاحية مطلوبان' });
    }

    const db = await readDB();
    const existingIndex = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

    if (existingIndex > -1) {
      const oldUser = db.users[existingIndex];
      db.users[existingIndex] = {
        username: oldUser.username,
        password: password ? await bcrypt.hash(password, 10) : oldUser.password,
        role: role
      };
    } else {
      if (!password) {
        return res.status(400).json({ error: 'كلمة المرور مطلوبة للمستخدم الجديد' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      db.users.push({ username, password: hashedPassword, role });
    }

    await writeDB(db);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { username } = req.params;
    if (username.toLowerCase() === 'admin') {
      return res.status(400).json({ error: 'لا يمكن حذف حساب الأدمن الأساسي' });
    }

    const db = await readDB();
    const index = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    db.users.splice(index, 1);
    await writeDB(db);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, saveUser, deleteUser };
