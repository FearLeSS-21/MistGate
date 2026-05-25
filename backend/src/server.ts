import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  authenticateJWT,
  requireAdmin,
} from './controllers/auth';
import {
  createApplication,
  getMyApplications,
  trackApplication,
  adminGetApplications,
  adminUpdateStatus,
  adminGetStats,
} from './controllers/applications';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from './controllers/notifications';
import {
  createComplaint,
  getMyComplaints,
  adminGetComplaints,
  adminRespondToComplaint,
  adminGetComplaintStats,
} from './controllers/complaints';
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getAvailableSlots,
  adminGetAppointments,
  adminUpdateAppointment,
  adminGetAppointmentStats,
} from './controllers/appointments';
import {
  submitRating,
  getApplicationRating,
  adminGetRatingStats,
} from './controllers/ratings';
import {
  adminGetActivities,
  adminGetRecentActivities,
} from './controllers/activities';
import { uploadFile } from './controllers/upload';
import { adminGetAnalytics } from './controllers/analytics';
import { chat } from './controllers/chatbot';
import { exportApplications, exportComplaints, exportAppointments } from './controllers/export';

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for API (frontend handles its own)
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10kb' }));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Public Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the MisrGate API',
    status: 'Running',
    version: '1.0.0',
  });
});

// --- Authentication Routes ---
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', authenticateJWT, logout);
app.get('/api/auth/profile', authenticateJWT, getProfile);
app.put('/api/auth/profile', authenticateJWT, updateProfile);
app.put('/api/auth/password', authenticateJWT, changePassword);

// --- Application Routes (Citizens) ---
app.post('/api/applications', authenticateJWT, createApplication);
app.get('/api/applications/my-applications', authenticateJWT, getMyApplications);
app.get('/api/applications/track/:trackingCode', trackApplication);

// --- Notification Routes ---
app.get('/api/notifications', authenticateJWT, getMyNotifications);
app.put('/api/notifications/:id/read', authenticateJWT, markAsRead);
app.put('/api/notifications/read-all', authenticateJWT, markAllAsRead);

// --- Complaint Routes (Citizens) ---
app.post('/api/complaints', authenticateJWT, createComplaint);
app.get('/api/complaints', authenticateJWT, getMyComplaints);

// --- Complaint Routes (Admin) ---
app.get('/api/admin/complaints', authenticateJWT, requireAdmin, adminGetComplaints);
app.put('/api/admin/complaints/:id/respond', authenticateJWT, requireAdmin, adminRespondToComplaint);
app.get('/api/admin/complaints/stats', authenticateJWT, requireAdmin, adminGetComplaintStats);

// --- Appointment Routes (Citizens) ---
app.get('/api/appointments/slots', authenticateJWT, getAvailableSlots);
app.post('/api/appointments', authenticateJWT, bookAppointment);
app.get('/api/appointments', authenticateJWT, getMyAppointments);
app.put('/api/appointments/:id/cancel', authenticateJWT, cancelAppointment);

// --- Appointment Routes (Admin) ---
app.get('/api/admin/appointments', authenticateJWT, requireAdmin, adminGetAppointments);
app.put('/api/admin/appointments/:id', authenticateJWT, requireAdmin, adminUpdateAppointment);
app.get('/api/admin/appointments/stats', authenticateJWT, requireAdmin, adminGetAppointmentStats);

// --- Rating Routes ---
app.post('/api/ratings/:applicationId', authenticateJWT, submitRating);
app.get('/api/ratings/:applicationId', authenticateJWT, getApplicationRating);
app.get('/api/admin/ratings', authenticateJWT, requireAdmin, adminGetRatingStats);

// --- Activity Log Routes (Admin) ---
app.get('/api/admin/activities', authenticateJWT, requireAdmin, adminGetActivities);
app.get('/api/admin/activities/recent', authenticateJWT, requireAdmin, adminGetRecentActivities);

// --- Chatbot Route (Demo) ---
app.post('/api/chatbot', chat);

// --- Admin Analytics Routes ---
app.get('/api/admin/analytics', authenticateJWT, requireAdmin, adminGetAnalytics);

// --- Data Export Routes (Admin) ---
app.get('/api/admin/export/applications', authenticateJWT, requireAdmin, exportApplications);
app.get('/api/admin/export/complaints', authenticateJWT, requireAdmin, exportComplaints);
app.get('/api/admin/export/appointments', authenticateJWT, requireAdmin, exportAppointments);

// --- Admin Control Routes ---
app.get('/api/admin/applications', authenticateJWT, requireAdmin, adminGetApplications);
app.put('/api/admin/applications/:id/status', authenticateJWT, requireAdmin, adminUpdateStatus);
app.get('/api/admin/stats', authenticateJWT, requireAdmin, adminGetStats);

// --- File Upload Route ---
app.post('/api/upload', authenticateJWT, upload.single('file'), uploadFile);

// --- 404 Route ---
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server] MisrGate API listening on port ${PORT}`);
});
