import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
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
  cancelApplication,
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
import { getMyFavorites, toggleFavorite } from './controllers/favorites';
import { getMyTimeline } from './controllers/timeline';
import { getActiveAnnouncements, adminGetAnnouncements, adminCreateAnnouncement, adminUpdateAnnouncement, adminDeleteAnnouncement } from './controllers/announcements';
import { adminGetReport } from './controllers/reports';
import { submitContact } from './controllers/contact';

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Security Middlewares
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
}));

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
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

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: 'Too many messages. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many chatbot requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/contact', contactLimiter);
app.use('/api/chatbot', chatLimiter);

app.use(express.json({ limit: '10kb' }));

// Multer config for file uploads
const ALLOWED_UPLOAD_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.pdf']);
const ALLOWED_UPLOAD_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ALLOWED_UPLOAD_EXT.has(ext) ? ext : ''}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 8 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_UPLOAD_MIME.has(file.mimetype) || !ALLOWED_UPLOAD_EXT.has(ext)) {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, PDF.'));
      return;
    }
    cb(null, true);
  },
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Disposition', 'inline');
  },
}));

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
app.put('/api/applications/:id/cancel', authenticateJWT, cancelApplication);

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
app.post('/api/contact', submitContact);

// --- Admin Analytics Routes ---
app.get('/api/admin/analytics', authenticateJWT, requireAdmin, adminGetAnalytics);

// --- Report Routes ---
app.get('/api/admin/report', authenticateJWT, requireAdmin, adminGetReport);

// --- Data Export Routes (Admin) ---
app.get('/api/admin/export/applications', authenticateJWT, requireAdmin, exportApplications);
app.get('/api/admin/export/complaints', authenticateJWT, requireAdmin, exportComplaints);
app.get('/api/admin/export/appointments', authenticateJWT, requireAdmin, exportAppointments);

// --- Admin Control Routes ---
app.get('/api/admin/applications', authenticateJWT, requireAdmin, adminGetApplications);
app.put('/api/admin/applications/:id/status', authenticateJWT, requireAdmin, adminUpdateStatus);
app.get('/api/admin/stats', authenticateJWT, requireAdmin, adminGetStats);

// --- File Upload Route ---
app.post('/api/upload', authenticateJWT, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed.' });
    }
    next();
  });
}, uploadFile);

// --- Timeline Route ---
app.get('/api/timeline', authenticateJWT, getMyTimeline);

// --- Favorite Services Routes ---
app.get('/api/favorites', authenticateJWT, getMyFavorites);
app.post('/api/favorites/toggle', authenticateJWT, toggleFavorite);

// --- Announcement Routes ---
app.get('/api/announcements', getActiveAnnouncements);
app.get('/api/admin/announcements', authenticateJWT, requireAdmin, adminGetAnnouncements);
app.post('/api/admin/announcements', authenticateJWT, requireAdmin, adminCreateAnnouncement);
app.put('/api/admin/announcements/:id', authenticateJWT, requireAdmin, adminUpdateAnnouncement);
app.delete('/api/admin/announcements/:id', authenticateJWT, requireAdmin, adminDeleteAnnouncement);

// --- 404 Route ---
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server] MisrGate API listening on port ${PORT}`);
});
