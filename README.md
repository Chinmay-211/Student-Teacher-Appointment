# 📚 Student-Teacher Appointment Booking System

This is a Firebase-based web application that allows students to register, search for teachers, book appointments, and send messages. Teachers can manage their appointments and student messages. Admins approve student registrations and manage teacher records.

---

## 🔧 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Firebase (Firestore, Auth)
- **Authentication:** Firebase Authentication
- **Database:** Firebase Firestore (NoSQL)

---

## 📁 Project Structure

public/
├── index.html # Default/redirect page
├── login.html # Login screen for all users
├── register.html # Registration form (students only)
│
├── dashboard/
│ ├── admin.html # Admin dashboard (approve users, manage teachers)
│ ├── teacher.html # Teacher dashboard (appointments, messages)
│ └── student.html # Student dashboard (search, book, message)
│
├── js/
│ ├── firebase-init.js # Firebase configuration
│ ├── logout.js # Logout + auth guards
│ ├── admin.js # Admin functionalities
│ ├── teacher.js # Teacher functionalities
│ ├── student.js # Student functionalities
│ └── register.js # Student registration logic

pgsql
Copy
Edit

---

## ✨ Features

### 👨‍🎓 Student
- Register as a student
- Login and access personal dashboard
- Search for teachers by name or subject
- Book appointments using a form interface
- Send messages to selected teachers
- View all booked appointments

### 👩‍🏫 Teacher
- Login with approved account
- View all appointment requests (approve/cancel/delete)
- View messages from students
- Delete messages

### 👨‍💼 Admin
- Login with admin credentials (e.g., admin@gmail.com)
- Approve new student registrations
- Add/update/delete teacher details
- View and manage pending user accounts

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/student-teacher-appointment.git
cd student-teacher-appointment
2. Firebase Configuration
Go to Firebase Console

Create a new project

Enable Authentication (Email/Password)

Enable Cloud Firestore

Create the following collections:

users (with fields: name, email, role, approved)

students

teachers

appointments

messages

3. Setup Firebase in the Project
Edit public/js/firebase-init.js:

js
Copy
Edit
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
🧪 Sample Admin Document (Firestore)
For admin access, insert this in users collection manually:

json
Copy
Edit
{
  "name": "admin",
  "email": "admin@gmail.com",
  "role": "admin",
  "approved": true
}