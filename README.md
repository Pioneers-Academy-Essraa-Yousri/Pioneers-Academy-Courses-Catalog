# Pioneers Academy Web Catalog

## Overview
This project is a dynamic, database-backed Node.js web application built for Pioneers Academy. Originally a static HTML/CSS catalog, it has been upgraded to feature a public-facing catalog view and a secure, premium administration panel (`/admin`) for content management. 

It uses a local JSON-based database (`db.json`) to store categories, courses, and teachers, enabling seamless dynamic updates without needing to edit code.

## Features
- **Public Catalog**: A beautiful, modern interface displaying teachers, courses, and categories. Users can filter by categories, search, and select teachers to send inquiries via WhatsApp.
- **Admin Dashboard**: A secure, authenticated control panel accessible at `/admin`.
- **Content Management**: Admins can dynamically add, edit, or delete categories (sections), courses, and teachers.
- **Media Uploads**: Teachers' photos can be uploaded directly via the admin panel, saving to the local `public/uploads/` directory.
- **Local Database**: All data is structured and saved in `db.json`, preventing data loss and providing a lightweight storage solution.

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: Local JSON File (`db.json`)
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Authentication**: JWT & Session-based authentication with `bcryptjs`
- **File Uploads**: `multer`

## Project Structure
```text
WebCatalog/
├── server.js               # Node.js Express server entry point
├── db.json                 # Local database (courses, categories, teachers)
├── package.json            # NPM configuration and dependencies
├── .env                    # Environment variables (Admin credentials, PORT)
├── public/                 # Static assets folder served by Express
│   ├── index.html          # Public catalog page
│   ├── style.css           # Styling for public catalog page
│   ├── script.js           # Frontend logic for the catalog
│   ├── admin.html          # Admin panel HTML
│   ├── admin.css           # Styling for the admin dashboard
│   ├── admin.js            # Frontend logic for admin CRUD operations
│   ├── login.html          # Admin login page
│   └── uploads/            # Uploaded teacher photos
└── scripts/
    └── migrate-data.js     # Data extraction script (used initially for migration)
```

## Setup & Installation

1. **Install Node.js**: Ensure Node.js is installed on your computer.
2. **Install Dependencies**: Open a terminal in the project directory and run:
   ```bash
   npm install
   ```
3. **Environment Configuration**: A `.env` file should be present in the root directory. If not, create one:
   ```env
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   JWT_SECRET=super_secret_jwt_key_for_pioneers_academy
   ```
4. **Start the Server**:
   ```bash
   npm start
   ```
   For development mode (auto-restart on file changes):
   ```bash
   npm run dev
   ```
5. **Access the Application**:
   - Public Catalog: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin (Default login: admin / admin)

## Data & Assets

- **`db.json`**: Contains all your categories, courses, and teacher information in JSON format. **Important:** Ensure you backup this file periodically.
- **`public/uploads/`**: Contains all images uploaded via the Admin Dashboard.

## API Endpoints Overview
The backend exposes the following API endpoints (secured endpoints require JWT authentication):
- `GET /api/catalog` - Retrieve all data
- `POST /api/categories` - Add a category
- `DELETE /api/categories/:id` - Delete a category
- `POST /api/courses` - Add a course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `POST /api/courses/:courseId/teachers` - Add a teacher to a course
- `DELETE /api/courses/:courseId/teachers/:teacherId` - Remove a teacher
- `POST /api/upload` - Upload a teacher image

## Authors & Credits
Developed and designed for Pioneers Academy by the development team.
