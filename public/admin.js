// --- ADMIN STATE ---
let categories = [];
let courses = [];
let adminToken = localStorage.getItem('adminToken') || '';

// DOM Elements
const loginOverlay = document.getElementById('loginOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');

// Initialize authentication status on page load
if (adminToken) {
  verifyToken();
} else {
  showLogin();
}

// Authentication Logic
async function verifyToken() {
  try {
    const res = await fetch('/api/catalog', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const role = localStorage.getItem('userRole') || 'viewer';
    if (res.status === 401) {
      showLogin();
    } else {
      hideLogin();
      applyUserRoleMode(role);
      loadAdminCatalog();
    }
  } catch (err) {
    showToast('حدث خطأ أثناء الاتصال بالسيرفر', 'danger');
    showLogin();
  }
}

function showLogin() {
  loginOverlay.style.display = 'flex';
  adminDashboard.style.display = 'none';
}

function hideLogin() {
  loginOverlay.style.display = 'none';
  adminDashboard.style.display = 'block';
}

function applyUserRoleMode(role) {
  document.body.classList.remove('view-only-mode', 'editor-mode');
  const userTab = document.getElementById('nav-users-tab');
  if (role === 'admin') {
    if (userTab) userTab.style.display = 'block';
  } else {
    if (userTab) userTab.style.display = 'none';
    
    // Switch tab if active tab is restricted tab-users
    const activeTabBtn = document.querySelector('.nav-tab.active');
    if (activeTabBtn && activeTabBtn.dataset.tab === 'tab-users') {
      document.querySelector('.nav-tab[data-tab="tab-home"]').click();
    }
    
    if (role === 'viewer') {
      document.body.classList.add('view-only-mode');
    } else if (role === 'editor') {
      document.body.classList.add('editor-mode');
    }
  }
}

// Handle Login Form Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userUsername', data.username);
      hideLogin();
      applyUserRoleMode(data.role);
      loadAdminCatalog();
      showToast('تم تسجيل الدخول بنجاح');
    } else {
      showToast(data.error || 'خطأ في تسجيل الدخول', 'danger');
    }
  } catch (err) {
    showToast('فشل الاتصال بالخادم', 'danger');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  adminToken = '';
  localStorage.removeItem('adminToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userUsername');
  document.body.classList.remove('view-only-mode', 'editor-mode');
  showLogin();
  showToast('تم تسجيل الخروج');
});

// Helper: Show Feedback Toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'danger') {
    toast.style.borderRightColor = 'var(--stamp-red)';
  } else {
    toast.style.borderRightColor = 'var(--gold)';
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Helper: Get Headers with Auth token
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
}

// --- TAB SWITCHING ---
document.querySelectorAll('.nav-tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    // Set active tab button
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    tabBtn.classList.add('active');

    // Set active tab content
    const targetTabId = tabBtn.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(targetTabId).classList.add('active');
  });
});

// --- API DATA FETCHING ---
async function loadAdminCatalog() {
  try {
    const res = await fetch('/api/catalog');
    if (res.status === 401) {
      showLogin();
      return;
    }
    const data = await res.json();
    categories = data.categories || [];
    courses = data.courses || [];

    updateStats();
    renderCategoriesTable();
    renderCoursesGrid();
    renderTeachersList();
    populateSelectDropdowns();
  } catch (err) {
    showToast('حدث خطأ أثناء تحميل البيانات', 'danger');
  }
}

// Update Home Statistics
function updateStats() {
  document.getElementById('stat-categories-count').textContent = categories.length;
  document.getElementById('stat-courses-count').textContent = courses.length;

  let totalTeachers = 0;
  courses.forEach(c => {
    totalTeachers += (c.teachers ? c.teachers.length : 0);
  });
  document.getElementById('stat-teachers-count').textContent = totalTeachers;
}

// Populate dropdowns with categories and courses dynamically
function populateSelectDropdowns() {
  const courseCategory = document.getElementById('courseCategory');
  const teacherCourseSelect = document.getElementById('teacherCourseSelect');

  // Categories select in course form
  courseCategory.innerHTML = '<option value="">-- اختر القسم --</option>';
  categories.forEach(cat => {
    courseCategory.innerHTML += `<option value="${cat.id}">${cat.nameAr}</option>`;
  });

  // Courses select in teacher form
  teacherCourseSelect.innerHTML = '<option value="">-- اختر الكورس --</option>';
  courses.forEach(c => {
    teacherCourseSelect.innerHTML += `<option value="${c.id}">${c.titleAr}</option>`;
  });
}

// --- CATEGORIES (SECTIONS) OPERATIONS ---
const openAddCategoryBtn = document.getElementById('openAddCategoryBtn');
const categoryFormContainer = document.getElementById('categoryFormContainer');
const categoryForm = document.getElementById('categoryForm');
const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');

openAddCategoryBtn.addEventListener('click', () => {
  document.getElementById('categoryFormTitle').textContent = 'إضافة قسم جديد';
  categoryForm.reset();
  document.getElementById('categoryId').value = '';
  document.getElementById('categoryNameEn').disabled = false;
  categoryFormContainer.style.display = 'block';
});

cancelCategoryBtn.addEventListener('click', () => {
  categoryFormContainer.style.display = 'none';
});

// Save category
categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('categoryId').value;
  const nameAr = document.getElementById('categoryNameAr').value.trim();
  const nameEn = document.getElementById('categoryNameEn').value.trim();

  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, nameAr, nameEn })
    });

    const data = await res.json();
    if (res.ok) {
      showToast('تم حفظ القسم بنجاح');
      categoryFormContainer.style.display = 'none';
      loadAdminCatalog();
    } else {
      showToast(data.error || 'فشل حفظ القسم', 'danger');
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'danger');
  }
});

function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTableBody');
  tbody.innerHTML = '';

  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">لا يوجد أقسام مسجلة حالياً.</td></tr>';
    return;
  }

  categories.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.nameAr}</td>
      <td class="ltr-label">${cat.id}</td>
      <td>
        <button class="admin-btn secondary-btn edit-cat-btn" data-id="${cat.id}">✏️ تعديل</button>
        <button class="admin-btn danger-btn delete-cat-btn" data-id="${cat.id}">🗑️ حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Edit Category handler
  tbody.querySelectorAll('.edit-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.id;
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        document.getElementById('categoryFormTitle').textContent = 'تعديل القسم';
        document.getElementById('categoryId').value = cat.id;
        document.getElementById('categoryNameAr').value = cat.nameAr;
        document.getElementById('categoryNameEn').value = cat.id;
        document.getElementById('categoryNameEn').disabled = true; // disable editing ID
        categoryFormContainer.style.display = 'block';
      }
    });
  });

  // Delete Category handler
  tbody.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const catId = btn.dataset.id;
      const cat = categories.find(c => c.id === catId);
      
      const confirmDelete = confirm(`⚠️ تحذير: هل أنت متأكد من حذف قسم "${cat.nameAr}"؟\nسيؤدي حذف القسم إلى حذف كافة الكورسات المسجلة تحته تلقائياً!`);
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/categories/${catId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (res.ok) {
          showToast('تم حذف القسم بنجاح');
          loadAdminCatalog();
        } else {
          const data = await res.json();
          showToast(data.error || 'فشل حذف القسم', 'danger');
        }
      } catch (err) {
        showToast('خطأ في الاتصال بالخادم', 'danger');
      }
    });
  });
}

// --- COURSES OPERATIONS ---
const openAddCourseBtn = document.getElementById('openAddCourseBtn');
const courseFormContainer = document.getElementById('courseFormContainer');
const courseForm = document.getElementById('courseForm');
const cancelCourseBtn = document.getElementById('cancelCourseBtn');
const addSyllabusPointBtn = document.getElementById('addSyllabusPointBtn');
const syllabusContainer = document.getElementById('syllabusContainer');

openAddCourseBtn.addEventListener('click', () => {
  document.getElementById('courseFormTitle').textContent = 'إضافة كورس جديد';
  courseForm.reset();
  document.getElementById('courseId').value = '';
  syllabusContainer.innerHTML = '';
  addSyllabusPoint(''); // add first blank syllabus point input
  courseFormContainer.style.display = 'block';
});

cancelCourseBtn.addEventListener('click', () => {
  courseFormContainer.style.display = 'none';
});

// Dynamic Syllabus Input Point Helpers
function addSyllabusPoint(val = '') {
  const row = document.createElement('div');
  row.className = 'syllabus-row';
  row.innerHTML = `
    <input type="text" class="syllabus-point-input" value="${val}" placeholder="مثال: أصوات الحروف وربطها بالكلمات">
    <button type="button" class="admin-btn danger-btn remove-syllabus-btn">❌</button>
  `;
  syllabusContainer.appendChild(row);

  row.querySelector('.remove-syllabus-btn').addEventListener('click', () => {
    row.remove();
  });
}

addSyllabusPointBtn.addEventListener('click', () => addSyllabusPoint(''));

// Save course submit handler
courseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('courseId').value;
  const category = document.getElementById('courseCategory').value;
  const titleAr = document.getElementById('courseTitleAr').value.trim();
  const titleEn = document.getElementById('courseTitleEn').value.trim();
  const tag = document.getElementById('courseTag').value.trim();
  const description = document.getElementById('courseDescription').value.trim();
  const comingSoon = document.getElementById('courseComingSoon').checked;
  const videoUrl = document.getElementById('courseVideoUrl').value.trim();

  // Extract syllabus points
  const syllabus = [];
  document.querySelectorAll('.syllabus-point-input').forEach(input => {
    const val = input.value.trim();
    if (val) syllabus.push(val);
  });

  const courseData = {
    id: id || undefined,
    category,
    titleAr,
    titleEn,
    tag,
    description,
    comingSoon,
    syllabus,
    videoUrl
  };

  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    const data = await res.json();
    if (res.ok) {
      showToast('تم حفظ الكورس بنجاح');
      courseFormContainer.style.display = 'none';
      loadAdminCatalog();
    } else {
      showToast(data.error || 'فشل حفظ الكورس', 'danger');
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'danger');
  }
});

function renderCoursesGrid() {
  const container = document.getElementById('coursesGrid');
  container.innerHTML = '';

  if (courses.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px;">لا يوجد كورسات مسجلة حالياً.</p>';
    return;
  }

  courses.forEach(c => {
    const catName = categories.find(cat => cat.id === c.category)?.nameAr || c.category;
    const card = document.createElement('div');
    card.className = 'course-admin-card';
    card.innerHTML = `
      <div class="corner"></div>
      <span class="category-badge">${catName}</span>
      <h3>${c.titleAr} ${c.comingSoon ? '🔒' : ''}</h3>
      <p class="tag-badge ltr-label">${c.tag}</p>
      <p class="course-desc">${c.description}</p>
      <div class="card-actions">
        <button class="admin-btn secondary-btn edit-course-btn" data-id="${c.id}">✏️ تعديل الكورس</button>
        <button class="admin-btn danger-btn delete-course-btn" data-id="${c.id}">🗑️ حذف</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Edit Course Handler
  container.querySelectorAll('.edit-course-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cId = btn.dataset.id;
      const c = courses.find(x => x.id === cId);
      if (c) {
        document.getElementById('courseFormTitle').textContent = 'تعديل الكورس';
        document.getElementById('courseId').value = c.id;
        document.getElementById('courseCategory').value = c.category;
        document.getElementById('courseTitleAr').value = c.titleAr;
        document.getElementById('courseTitleEn').value = c.titleEn;
        document.getElementById('courseTag').value = c.tag;
        document.getElementById('courseDescription').value = c.description;
        document.getElementById('courseComingSoon').checked = !!c.comingSoon;
        document.getElementById('courseVideoUrl').value = c.videoUrl || '';

        // Load Syllabus Points
        syllabusContainer.innerHTML = '';
        if (c.syllabus && c.syllabus.length) {
          c.syllabus.forEach(s => addSyllabusPoint(s));
        } else {
          addSyllabusPoint('');
        }

        courseFormContainer.style.display = 'block';
        // Scroll to form
        courseFormContainer.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Delete Course Handler
  container.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cId = btn.dataset.id;
      const c = courses.find(x => x.id === cId);
      
      const confirmDelete = confirm(`هل أنت متأكد من حذف كورس "${c.titleAr}"؟\nسيتم حذف كافة بيانات المدرسين التابعين لهذا الكورس أيضاً!`);
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/courses/${cId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (res.ok) {
          showToast('تم حذف الكورس بنجاح');
          loadAdminCatalog();
        } else {
          const data = await res.json();
          showToast(data.error || 'فشل حذف الكورس', 'danger');
        }
      } catch (err) {
        showToast('خطأ في الاتصال بالخادم', 'danger');
      }
    });
  });
}

// --- TEACHERS OPERATIONS ---
const openAddTeacherBtn = document.getElementById('openAddTeacherBtn');
const teacherFormContainer = document.getElementById('teacherFormContainer');
const teacherForm = document.getElementById('teacherForm');
const cancelTeacherBtn = document.getElementById('cancelTeacherBtn');
const teacherPhotoUpload = document.getElementById('teacherPhotoUpload');
const triggerUploadBtn = document.getElementById('triggerUploadBtn');
const teacherPhotoUrl = document.getElementById('teacherPhotoUrl');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');

openAddTeacherBtn.addEventListener('click', () => {
  document.getElementById('teacherFormTitle').textContent = 'إضافة مدرس لكورس';
  teacherForm.reset();
  document.getElementById('teacherCourseSelect').disabled = false;
  imagePreviewContainer.style.display = 'none';
  teacherFormContainer.style.display = 'block';
});

cancelTeacherBtn.addEventListener('click', () => {
  teacherFormContainer.style.display = 'none';
});

// Photo Upload Triggering
triggerUploadBtn.addEventListener('click', () => {
  teacherPhotoUpload.click();
});

teacherPhotoUpload.addEventListener('change', async () => {
  if (teacherPhotoUpload.files.length === 0) return;
  const file = teacherPhotoUpload.files[0];

  // Upload file immediately via AJAX
  const formData = new FormData();
  formData.append('photo', file);

  try {
    showToast('جاري رفع الصورة...');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      teacherPhotoUrl.value = data.url;
      imagePreview.src = data.url;
      imagePreviewContainer.style.display = 'block';
      showToast('تم رفع الصورة بنجاح');
    } else {
      showToast(data.error || 'فشل رفع الصورة', 'danger');
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم أثناء رفع الصورة', 'danger');
  }
});

// Update preview when typing link manually
teacherPhotoUrl.addEventListener('input', () => {
  const url = teacherPhotoUrl.value.trim();
  if (url) {
    imagePreview.src = url;
    imagePreviewContainer.style.display = 'block';
  } else {
    imagePreviewContainer.style.display = 'none';
  }
});

// Save teacher details
teacherForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const courseId = document.getElementById('teacherCourseSelect').value;
  const name = document.getElementById('teacherName').value.trim();
  const stage = document.getElementById('teacherStage').value.trim();
  const curriculum = document.getElementById('teacherCurriculum').value.trim();
  const priceLabel = document.getElementById('teacherPriceLabel').value.trim();
  const quality = document.getElementById('teacherQuality').value.trim();
  const academicVal = document.getElementById('teacherAcademicRating').value;
  const pronunciationVal = document.getElementById('teacherPronunciationRating').value;
  const videoUrl = document.getElementById('teacherVideoUrl').value.trim();
  const photo = teacherPhotoUrl.value.trim();

  // Convert academic and pronunciation to integers if they are digits
  const academic = /^\d+$/.test(academicVal) ? parseInt(academicVal) : academicVal;
  const pronunciation = pronunciationVal ? parseInt(pronunciationVal) : undefined;

  const teacherData = {
    name,
    stage,
    curriculum,
    priceLabel,
    quality,
    academic,
    pronunciation,
    videoUrl,
    photo
  };

  try {
    const res = await fetch(`/api/courses/${courseId}/teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData)
    });

    const data = await res.json();
    if (res.ok) {
      showToast('تم حفظ بيانات المعلم بنجاح');
      teacherFormContainer.style.display = 'none';
      loadAdminCatalog();
    } else {
      showToast(data.error || 'فشل حفظ بيانات المعلم', 'danger');
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'danger');
  }
});

function renderTeachersList() {
  const container = document.getElementById('teachersGroupedContainer');
  container.innerHTML = '';

  const coursesWithTeachers = courses.filter(c => c.teachers && c.teachers.length > 0);

  if (coursesWithTeachers.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:20px;">لا يوجد معلمين مسجلين حالياً. قم بإضافة معلم وتعيينه لكورس.</p>';
    return;
  }

  coursesWithTeachers.forEach(c => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'course-teachers-group';
    
    groupDiv.innerHTML = `
      <h3>${c.titleAr} (${c.teachers.length})</h3>
      <div class="teachers-subgrid">
        ${c.teachers.map(t => {
          return `
            <div class="teacher-admin-card">
              <div class="teacher-header">
                ${t.photo ? `<img class="teacher-avatar" src="${t.photo}" alt="">` : '<div class="teacher-avatar" style="background:#ddd; display:flex; align-items:center; justify-content:center; font-size:20px;">👤</div>'}
                <div class="teacher-title">
                  <span class="name ltr-label">${t.name}</span>
                  <span class="stage">${t.stage || 'مدرس الكورس'}</span>
                </div>
              </div>
              <div class="teacher-details-list">
                <span>📚 خبرة: ${t.academic}</span>
                ${t.pronunciation ? `<span>🗣️ نطق: ${t.pronunciation}</span>` : ''}
                ${t.curriculum ? `<span class="ltr-label">📖 المنهج: ${t.curriculum}</span>` : ''}
                <span>💰 السعر: ${t.priceLabel || 'غير محدد'}</span>
              </div>
              <div class="card-actions" style="margin-top: 10px; border-top: 1px dashed var(--paper-line); padding-top: 10px;">
                <button class="admin-btn secondary-btn edit-teacher-btn" data-course-id="${c.id}" data-name="${t.name}">✏️ تعديل</button>
                <button class="admin-btn danger-btn delete-teacher-btn" data-course-id="${c.id}" data-name="${t.name}">🗑️ حذف</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(groupDiv);
  });

  // Edit Teacher Handler
  container.querySelectorAll('.edit-teacher-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.dataset.courseId;
      const tName = btn.dataset.name;
      
      const course = courses.find(x => x.id === courseId);
      const teacher = course.teachers.find(t => t.name === tName);
      
      if (teacher) {
        document.getElementById('teacherFormTitle').textContent = 'تعديل بيانات المعلم';
        document.getElementById('teacherCourseSelect').value = courseId;
        document.getElementById('teacherCourseSelect').disabled = true; // disable editing assigned course
        document.getElementById('teacherName').value = teacher.name;
        document.getElementById('teacherStage').value = teacher.stage || '';
        document.getElementById('teacherCurriculum').value = teacher.curriculum || '';
        document.getElementById('teacherPriceLabel').value = teacher.priceLabel || '';
        document.getElementById('teacherQuality').value = teacher.quality || '';
        document.getElementById('teacherAcademicRating').value = teacher.academic;
        document.getElementById('teacherPronunciationRating').value = teacher.pronunciation || '';
        document.getElementById('teacherVideoUrl').value = teacher.videoUrl || '';
        teacherPhotoUrl.value = teacher.photo || '';

        if (teacher.photo) {
          imagePreview.src = teacher.photo;
          imagePreviewContainer.style.display = 'block';
        } else {
          imagePreviewContainer.style.display = 'none';
        }

        teacherFormContainer.style.display = 'block';
        teacherFormContainer.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Delete Teacher Handler
  container.querySelectorAll('.delete-teacher-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const courseId = btn.dataset.courseId;
      const tName = btn.dataset.name;

      const confirmDelete = confirm(`هل أنت متأكد من حذف المدرس "${tName}" من هذا الكورس؟`);
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/courses/${courseId}/teachers/${encodeURIComponent(tName)}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (res.ok) {
          showToast('تم حذف المدرس بنجاح');
          loadAdminCatalog();
        } else {
          const data = await res.json();
          showToast(data.error || 'فشل حذف المدرس', 'danger');
        }
      } catch (err) {
        showToast('خطأ في الاتصال بالخادم', 'danger');
      }
    });
  });
}

// --- USER MANAGEMENT OPERATIONS ---
const openAddUserBtn = document.getElementById('openAddUserBtn');
const userFormContainer = document.getElementById('userFormContainer');
const userForm = document.getElementById('userForm');
const cancelUserBtn = document.getElementById('cancelUserBtn');

// Add user management tab listener
document.querySelectorAll('.nav-tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    if (tabBtn.dataset.tab === 'tab-users') {
      loadAdminUsers();
    }
  });
});

openAddUserBtn.addEventListener('click', () => {
  document.getElementById('userFormTitle').textContent = 'إضافة مستخدم جديد';
  userForm.reset();
  document.getElementById('userUsername').disabled = false;
  document.getElementById('userPassword').required = true;
  document.getElementById('userPassword').placeholder = 'أدخل كلمة المرور';
  userFormContainer.style.display = 'block';
});

cancelUserBtn.addEventListener('click', () => {
  userFormContainer.style.display = 'none';
});

// Save user (restricted to Full Admin)
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('userUsername').value.trim();
  const password = document.getElementById('userPassword').value.trim();
  const role = document.getElementById('userRole').value;

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();
    if (res.ok) {
      showToast('تم حفظ الحساب بنجاح');
      userFormContainer.style.display = 'none';
      loadAdminUsers();
      updateStats(); // Update teacher/course stats just in case
    } else {
      showToast(data.error || 'فشل حفظ الحساب', 'danger');
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'danger');
  }
});

// Load admin users list
async function loadAdminUsers() {
  try {
    const res = await fetch('/api/users', {
      headers: getAuthHeaders()
    });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (res.status === 403) {
      showToast('غير مسموح لك بالوصول لإدارة المستخدمين', 'danger');
      document.querySelector('.nav-tab[data-tab="tab-home"]').click();
      return;
    }
    const data = await res.json();
    renderUsersTable(data);
  } catch (err) {
    showToast('حدث خطأ أثناء تحميل حسابات المستخدمين', 'danger');
  }
}

function renderUsersTable(usersList) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';

  usersList.forEach(u => {
    const tr = document.createElement('tr');
    let roleText = 'مشاهد فقط';
    if (u.role === 'admin') roleText = 'مدير كامل';
    if (u.role === 'editor') roleText = 'محرر';

    tr.innerHTML = `
      <td>${u.username}</td>
      <td><code>${u.password}</code></td>
      <td>${roleText}</td>
      <td>
        <button class="admin-btn secondary-btn edit-user-btn" data-username="${u.username}">✏️ تعديل</button>
        <button class="admin-btn danger-btn delete-user-btn" data-username="${u.username}" ${u.username.toLowerCase() === 'admin' ? 'disabled' : ''}>🗑️ حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Edit User Handler
  tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const username = btn.dataset.username;
      const user = usersList.find(u => u.username === username);
      if (user) {
        document.getElementById('userFormTitle').textContent = 'تعديل الحساب';
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userUsername').disabled = true; // disable editing username key
        document.getElementById('userPassword').required = false;
        document.getElementById('userPassword').placeholder = 'اتركها فارغة للتعديل دون تغيير كلمة المرور';
        document.getElementById('userRole').value = user.role;
        userFormContainer.style.display = 'block';
      }
    });
  });

  // Delete User Handler
  tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const username = btn.dataset.username;
      if (username.toLowerCase() === 'admin') {
        showToast('لا يمكن حذف حساب الأدمن الأساسي', 'danger');
        return;
      }

      const confirmDelete = confirm(`هل أنت متأكد من حذف الحساب "${username}"؟`);
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (res.ok) {
          showToast('تم حذف الحساب بنجاح');
          loadAdminUsers();
        } else {
          const data = await res.json();
          showToast(data.error || 'فشل حذف الحساب', 'danger');
        }
      } catch (err) {
        showToast('خطأ في الاتصال بالخادم', 'danger');
      }
    });
  });
}
