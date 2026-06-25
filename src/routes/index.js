const express = require('express');
const router = express.Router();

const { login } = require('../controllers/auth.controller');
const { getUsers, saveUser, deleteUser } = require('../controllers/user.controller');
const { saveCategory, deleteCategory } = require('../controllers/category.controller');
const { saveCourse, deleteCourse, saveTeacher, deleteTeacher, getCatalog } = require('../controllers/course.controller');
const { checkAuth, requireAdmin, requireEditor } = require('../middlewares/auth.middleware');

// Public / Auth
router.post('/login', login);
router.get('/catalog', getCatalog); // Used by public site and admin dashboard

// Users
router.get('/users', checkAuth, requireAdmin, getUsers);
router.post('/users', checkAuth, requireAdmin, saveUser);
router.delete('/users/:username', checkAuth, requireAdmin, deleteUser);

// Categories
router.post('/categories', checkAuth, requireEditor, saveCategory);
router.delete('/categories/:id', checkAuth, requireAdmin, deleteCategory);

// Courses
router.post('/courses', checkAuth, requireEditor, saveCourse);
router.delete('/courses/:id', checkAuth, requireAdmin, deleteCourse);

// Teachers
router.post('/courses/:courseId/teachers', checkAuth, requireEditor, saveTeacher);
router.delete('/courses/:courseId/teachers/:teacherName', checkAuth, requireAdmin, deleteTeacher);

module.exports = router;
