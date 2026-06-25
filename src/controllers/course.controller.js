const { readDB, writeDB } = require('../config/db');

async function saveCourse(req, res, next) {
  try {
    const course = req.body;
    if (!course.category || !course.titleAr || !course.titleEn) {
      return res.status(400).json({ error: 'البيانات الأساسية للكورس ناقصة' });
    }

    const db = await readDB();

    if (!course.id) {
      course.id = course.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36).substring(4);
    }

    const existingIndex = db.courses.findIndex(c => c.id === course.id);
    if (existingIndex > -1) {
      const oldCourse = db.courses[existingIndex];
      db.courses[existingIndex] = {
        ...oldCourse,
        ...course,
        teachers: course.teachers || oldCourse.teachers || []
      };
    } else {
      course.teachers = course.teachers || [];
      course.syllabus = course.syllabus || [];
      db.courses.push(course);
    }

    await writeDB(db);
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const db = await readDB();

    const index = db.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'الكورس غير موجود' });
    }

    db.courses.splice(index, 1);
    await writeDB(db);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function saveTeacher(req, res, next) {
  try {
    const { courseId } = req.params;
    const teacher = req.body;

    if (!teacher.name) {
      return res.status(400).json({ error: 'اسم المدرس مطلوب' });
    }

    const db = await readDB();
    const courseIndex = db.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'الكورس غير موجود' });
    }

    const course = db.courses[courseIndex];
    course.teachers = course.teachers || [];

    const existingIndex = course.teachers.findIndex(t => t.name === teacher.name);
    if (existingIndex > -1) {
      const oldTeacher = course.teachers[existingIndex];
      course.teachers[existingIndex] = {
        ...oldTeacher,
        ...teacher,
        photo: teacher.photo || oldTeacher.photo
      };
    } else {
      course.teachers.push(teacher);
    }

    await writeDB(db);
    res.json({ success: true, teacher });
  } catch (err) {
    next(err);
  }
}

async function deleteTeacher(req, res, next) {
  try {
    const { courseId, teacherName } = req.params;
    const db = await readDB();

    const courseIndex = db.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'الكورس غير موجود' });
    }

    const course = db.courses[courseIndex];
    course.teachers = course.teachers || [];

    const teacherIndex = course.teachers.findIndex(t => t.name === teacherName);
    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'المدرس غير موجود' });
    }

    course.teachers.splice(teacherIndex, 1);
    await writeDB(db);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function getCatalog(req, res, next) {
  try {
    const db = await readDB();
    res.json({ categories: db.categories, courses: db.courses });
  } catch (err) {
    next(err);
  }
}

module.exports = { saveCourse, deleteCourse, saveTeacher, deleteTeacher, getCatalog };
