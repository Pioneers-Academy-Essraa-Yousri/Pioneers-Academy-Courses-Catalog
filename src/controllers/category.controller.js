const { readDB, writeDB } = require('../config/db');

async function saveCategory(req, res, next) {
  try {
    const { id, nameAr, nameEn } = req.body;
    if (!nameAr || !nameEn) {
      return res.status(400).json({ error: 'الاسم بالعربية والإنجليزية مطلوبان' });
    }

    const db = await readDB();
    const categoryId = id || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!id && db.categories.find(c => c.id === categoryId)) {
      return res.status(400).json({ error: 'القسم بالاسم الإنجليزي هذا موجود بالفعل' });
    }

    const existingIndex = db.categories.findIndex(c => c.id === categoryId);
    if (existingIndex > -1) {
      db.categories[existingIndex] = { id: categoryId, nameAr, nameEn };
    } else {
      db.categories.push({ id: categoryId, nameAr, nameEn });
    }

    await writeDB(db);
    res.json({ success: true, category: { id: categoryId, nameAr, nameEn } });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    const index = db.categories.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'القسم غير موجود' });
    }

    db.categories.splice(index, 1);
    db.courses = db.courses.filter(c => c.category !== id);

    await writeDB(db);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { saveCategory, deleteCategory };
