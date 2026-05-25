# MisrGate — Egyptian E-Government Services Portal

MisrGate is a full-stack digital government services portal. Citizens can apply for official documents, track applications in real time, book appointments, submit feedback, and rate services. Administrators have a dedicated desk to review, approve, or reject applications with full audit trail, manage complaints, and monitor system activity.

## Features

### 🏛️ Application Services
- **8 government services** — National ID, Military & Recruitment, Civil Registry, Passport, Tax Payment, Traffic Fines, Health Insurance, Social Insurance
- **Public tracking** — Search any application by 11-digit tracking code
- **Service ratings** — Rate completed applications with star scores and reviews
- **Document submission** — Per-service form validation with Zod

### 📅 Appointment Booking
- **Department slot booking** — Choose from 8 government departments
- **Real-time availability** — See and select available time slots per date
- **Admin management** — View and manage all citizen appointments

### 🔔 Notifications
- **In-app notifications** — Real-time status change alerts
- **Unread badge** — Notification bell with unread count in navbar
- **Mark read** — Individual or bulk mark-as-read

### 💬 Complaints & Feedback
- **Citizen submissions** — Categorized feedback (service quality, technical issues, suggestions, etc.)
- **Admin response** — Review and respond with full thread history
- **Status tracking** — Open → Under Review → Resolved → Closed

### 🔐 Authentication & Roles
- **JWT authentication** — Register, login, and role-based access (Citizen / Admin)
- **Developer bypass** — Built-in mock user toggle for quick demo (no login required)

### 🌐 Internationalization
- **Bilingual UI** — English / Arabic with full RTL layout
- **Inline translation** — Simple `t(en, ar)` helper pattern

### 📊 Admin Tools
- **Audit desk** — Review queue with filters, status updates, and timeline logging
- **Pagination & search** — Search by name, tracking code, or national ID
- **Dashboard stats** — Application counts by status and service type
- **Activity audit log** — Full system activity trail with action filtering
- **Complaints management** — Categorized queue with response workflow
- **Appointment oversight** — View all scheduled appointments

### 🗄️ Data Models
- **User** — email, national ID (14 digits), role (Citizen/Admin)
- **Application** — service type, JSON form data, tracking code, status, attachment URL
- **StatusHistory** — Audit trail with timestamp, officer name, and notes
- **Notification** — User-targeted alerts with type, read status, and deep link
- **Complaint** — Categorized feedback with admin response thread
- **Appointment** — Department, date, time slot, status with user relation
- **ServiceRating** — Score (1-5) and review linked to completed applications
- **ActivityLog** — System-wide action logging with user and details
