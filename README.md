# 📸 Media Gallery Management System

A MERN (MongoDB, Express, React, Node.js) based application for managing media assets such as images and videos.  
It allows users to upload, organize, view, and manage their media in a modern, responsive gallery interface.

---

## 🚀 Features

- **User Authentication**
  - Login & Registration
  - Secure password hashing
- **Media Upload**
  - Drag & drop upload support
  - Multiple file formats supported (JPG, PNG, MP4, etc.)
- **Gallery View**
  - Grid-based, responsive layout
  - Media preview & lightbox view
- **Search & Filter**
  - Find media by title, tags, or date
- **Media Management**
  - Edit media details (title, description, tags)
  - Delete media
- **Backend API**
  - REST API built with Express & MongoDB
  - File uploads handled via Multer
- **Environment Config**
  - `.env` for sensitive credentials

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Axios
- Tailwind CSS / CSS modules

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose
- Multer (file uploads)

---

## 📂 Folder Structure

Media-Gallery-Management-System/
│
├── backend/ # Express server
│ ├── config/ # DB & environment configs
│ ├── controllers/ # API request handlers
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API endpoints
│ ├── uploads/ # Uploaded media storage
│ └── server.js # Main server file
│
├── frontend/ # React client
│ ├── public/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page views
│ │ ├── services/ # API calls
│ │ ├── App.js
│ │ └── index.js
│
└── README.md



