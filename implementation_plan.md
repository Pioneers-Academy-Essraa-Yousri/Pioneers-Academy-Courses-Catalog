# Implementation Plan: Web Catalog Transformation to Node.js Web App

This plan details the transformation of the Pioneers Academy Web Catalog from a static HTML/CSS page into a dynamic, database-backed Node.js web application. The application will include a public catalog view, a local JSON-based database to store categories, courses, and teachers, and a secure, premium administration panel (`/admin`) for content management.

## User Review Required

> [!IMPORTANT]
> **Data Preservation**: We will run a data migration script to automatically extract the existing courses, teachers, and Base64 photos from your current `index.html` and save them into the new JSON database (`db.json`). None of your existing data will be lost.
>
> **Local Server Execution**: After implementation, you will run the web app locally using Node.js (`npm run dev` or `npm start`). It will listen on a local port (e.g., `http://localhost:3000`), allowing you to view it in the browser and manage the catalog.
>
> **Authentication**: The admin panel will be secured using a simple session-based login (credentials configured in a `.env` file or default to admin/admin).

## Proposed Changes

We will reorganize the project files into a standard Node.js server structure:
```
WebCatalog/
├── server.js               # Node.js Express server
├── db.json                 # Local database (courses, categories, teachers)
├── package.json            # NPM configuration and dependencies
├── .env.example            # Template for environment variables (admin password, port)
├── public/                 # Static assets folder served by Express
│   ├── index.html          # Public catalog page (fetches data from API)
│   ├── style.css           # Styling for public catalog page
│   ├── Icon round-2.png    # Academy logo
│   ├── admin.html          # Admin panel page (add/remove sections, courses, teachers)
│   ├── admin.css           # Premium styling for the admin panel
│   ├── admin.js            # Frontend logic for admin panel CRUD operations
│   └── uploads/            # Directory to store uploaded teacher photos (instead of huge base64 strings)
└── scripts/
    └── migrate-data.js     # Data extraction script (run once to create db.json)
```

---

### Backend Components

#### [NEW] [package.json](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/package.json)
- Define scripts: `"start": "node server.js"`, `"dev": "node --watch server.js"`.
- Dependencies: `express` (web server), `multer` (for image file uploads), `uuid` (for generating unique IDs), `dotenv` (for config).

#### [NEW] [server.js](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/server.js)
- Build an Express server hosting the public site and backend API endpoints:
  - `GET /api/catalog`: Returns categories, courses, and teachers.
  - `POST /api/categories`: Add a new category/section.
  - `DELETE /api/categories/:id`: Remove a category/section.
  - `POST /api/courses`: Add/edit a course.
  - `DELETE /api/courses/:id`: Delete a course.
  - `POST /api/courses/:courseId/teachers`: Add/edit a teacher in a course.
  - `DELETE /api/courses/:courseId/teachers/:teacherName`: Remove a teacher.
  - `POST /api/upload`: Handles file uploads for teacher photos, saving them to `public/uploads/` and returning their relative URL.
  - Basic Authentication middleware for admin API endpoints.

#### [NEW] [db.json](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/db.json)
- Store all categories (sections), courses, and teacher details in structured JSON.
- Dynamically read and written to by `server.js` using atomic file writes.

#### [NEW] [migrate-data.js](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/scripts/migrate-data.js)
- A migration script that reads the large JavaScript array from `index.html`, parses it, and writes the structured database into `db.json` so no data is lost.

---

### Frontend Components

#### [MODIFY] [index.html](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/index.html)
- Clean up the file by extracting the inline data.
- Fetch the courses array and categories from `/api/catalog` on load.
- Dynamically build the category filter tabs based on the backend sections.
- Move stylesheet link and clean up inline CSS if necessary, or preserve it to maintain the design perfectly.

#### [NEW] [admin.html](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/public/admin.html)
- Create a modern, high-aesthetic dashboard matching the original color theme (Teal, Gold, Sand, Cairo font) to manage the catalog content.
- Feature tabs: **الرئيسية** (Overview), **الأقسام** (Sections/Tabs), **الكورسات** (Courses), **المدرسين** (Teachers).
- Rich form fields to add/edit teachers:
  - Name, Tag, Quality (traits like "Kind", "Easy Going")
  - Academic & Pronunciation star ratings
  - Stage, Curriculum, Price Label, Video Link (YouTube/Google Drive preview URL)
  - Image Upload input (drag-and-drop or select file) with a visual preview.

#### [NEW] [admin.css](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/public/admin.css)
- Custom CSS utilizing CSS variables from the original design, applying modern elements: rounded cards, glassmorphism, responsive grid forms, and beautiful alerts.

#### [NEW] [admin.js](file:///d:/TRAINING/WEB%20Dev/Projects/Pioneers%20Academy_Essraa%20Yousri/WebCatalog/WebCatalogByAhmadalshabory/public/admin.js)
- Handle API authentication, form submissions, dynamic updates, deletion modals, and file uploads.

---

## Verification Plan

### Automated Verification
- Run Node server validation: `node server.js` to ensure the server starts without issues.
- Verify JSON database read/write routines through endpoint tests.

### Manual Verification
- **Step 1**: Run the migration script and inspect `db.json` to verify all courses, categories, and teachers were successfully imported.
- **Step 2**: Open the website locally at `http://localhost:3000`. Test the catalog filter tabs, search input, and WhatsApp selection.
- **Step 3**: Navigate to `http://localhost:3000/admin`.
  - Log in using credentials.
  - Add a new Category (e.g., "ألعاب ذكاء"). Verify it appears immediately as a new filter tab on the public page.
  - Delete a Category. Verify all courses in it are handled properly.
  - Add a new Course under a category.
  - Add a Teacher to a course: input name, upload a photo, set ratings, and enter a Google Drive video link.
  - Delete a Teacher and verify they are removed from the course.
  - Reload the public page and verify that all updates are visible.
