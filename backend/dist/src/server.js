"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./controllers/auth");
const applications_1 = require("./controllers/applications");
const notifications_1 = require("./controllers/notifications");
const complaints_1 = require("./controllers/complaints");
const appointments_1 = require("./controllers/appointments");
const ratings_1 = require("./controllers/ratings");
const activities_1 = require("./controllers/activities");
const upload_1 = require("./controllers/upload");
const analytics_1 = require("./controllers/analytics");
const chatbot_1 = require("./controllers/chatbot");
const export_1 = require("./controllers/export");
const favorites_1 = require("./controllers/favorites");
const announcements_1 = require("./controllers/announcements");
// Initialize dotenv configuration
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disabled for API (frontend handles its own)
    crossOriginEmbedderPolicy: false,
}));
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// Rate limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    message: { error: 'Too many attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use(express_1.default.json({ limit: '10kb' }));
// Multer config for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
// Public Welcome Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the MisrGate API',
        status: 'Running',
        version: '1.0.0',
    });
});
// --- Authentication Routes ---
app.post('/api/auth/register', auth_1.register);
app.post('/api/auth/login', auth_1.login);
app.post('/api/auth/logout', auth_1.authenticateJWT, auth_1.logout);
app.get('/api/auth/profile', auth_1.authenticateJWT, auth_1.getProfile);
app.put('/api/auth/profile', auth_1.authenticateJWT, auth_1.updateProfile);
app.put('/api/auth/password', auth_1.authenticateJWT, auth_1.changePassword);
// --- Application Routes (Citizens) ---
app.post('/api/applications', auth_1.authenticateJWT, applications_1.createApplication);
app.get('/api/applications/my-applications', auth_1.authenticateJWT, applications_1.getMyApplications);
app.get('/api/applications/track/:trackingCode', applications_1.trackApplication);
// --- Notification Routes ---
app.get('/api/notifications', auth_1.authenticateJWT, notifications_1.getMyNotifications);
app.put('/api/notifications/:id/read', auth_1.authenticateJWT, notifications_1.markAsRead);
app.put('/api/notifications/read-all', auth_1.authenticateJWT, notifications_1.markAllAsRead);
// --- Complaint Routes (Citizens) ---
app.post('/api/complaints', auth_1.authenticateJWT, complaints_1.createComplaint);
app.get('/api/complaints', auth_1.authenticateJWT, complaints_1.getMyComplaints);
// --- Complaint Routes (Admin) ---
app.get('/api/admin/complaints', auth_1.authenticateJWT, auth_1.requireAdmin, complaints_1.adminGetComplaints);
app.put('/api/admin/complaints/:id/respond', auth_1.authenticateJWT, auth_1.requireAdmin, complaints_1.adminRespondToComplaint);
app.get('/api/admin/complaints/stats', auth_1.authenticateJWT, auth_1.requireAdmin, complaints_1.adminGetComplaintStats);
// --- Appointment Routes (Citizens) ---
app.get('/api/appointments/slots', auth_1.authenticateJWT, appointments_1.getAvailableSlots);
app.post('/api/appointments', auth_1.authenticateJWT, appointments_1.bookAppointment);
app.get('/api/appointments', auth_1.authenticateJWT, appointments_1.getMyAppointments);
app.put('/api/appointments/:id/cancel', auth_1.authenticateJWT, appointments_1.cancelAppointment);
// --- Appointment Routes (Admin) ---
app.get('/api/admin/appointments', auth_1.authenticateJWT, auth_1.requireAdmin, appointments_1.adminGetAppointments);
app.put('/api/admin/appointments/:id', auth_1.authenticateJWT, auth_1.requireAdmin, appointments_1.adminUpdateAppointment);
app.get('/api/admin/appointments/stats', auth_1.authenticateJWT, auth_1.requireAdmin, appointments_1.adminGetAppointmentStats);
// --- Rating Routes ---
app.post('/api/ratings/:applicationId', auth_1.authenticateJWT, ratings_1.submitRating);
app.get('/api/ratings/:applicationId', auth_1.authenticateJWT, ratings_1.getApplicationRating);
app.get('/api/admin/ratings', auth_1.authenticateJWT, auth_1.requireAdmin, ratings_1.adminGetRatingStats);
// --- Activity Log Routes (Admin) ---
app.get('/api/admin/activities', auth_1.authenticateJWT, auth_1.requireAdmin, activities_1.adminGetActivities);
app.get('/api/admin/activities/recent', auth_1.authenticateJWT, auth_1.requireAdmin, activities_1.adminGetRecentActivities);
// --- Chatbot Route (Demo) ---
app.post('/api/chatbot', chatbot_1.chat);
// --- Admin Analytics Routes ---
app.get('/api/admin/analytics', auth_1.authenticateJWT, auth_1.requireAdmin, analytics_1.adminGetAnalytics);
// --- Data Export Routes (Admin) ---
app.get('/api/admin/export/applications', auth_1.authenticateJWT, auth_1.requireAdmin, export_1.exportApplications);
app.get('/api/admin/export/complaints', auth_1.authenticateJWT, auth_1.requireAdmin, export_1.exportComplaints);
app.get('/api/admin/export/appointments', auth_1.authenticateJWT, auth_1.requireAdmin, export_1.exportAppointments);
// --- Admin Control Routes ---
app.get('/api/admin/applications', auth_1.authenticateJWT, auth_1.requireAdmin, applications_1.adminGetApplications);
app.put('/api/admin/applications/:id/status', auth_1.authenticateJWT, auth_1.requireAdmin, applications_1.adminUpdateStatus);
app.get('/api/admin/stats', auth_1.authenticateJWT, auth_1.requireAdmin, applications_1.adminGetStats);
// --- File Upload Route ---
app.post('/api/upload', auth_1.authenticateJWT, upload.single('file'), upload_1.uploadFile);
// --- Favorite Services Routes ---
app.get('/api/favorites', auth_1.authenticateJWT, favorites_1.getMyFavorites);
app.post('/api/favorites/toggle', auth_1.authenticateJWT, favorites_1.toggleFavorite);
// --- Announcement Routes ---
app.get('/api/announcements', announcements_1.getActiveAnnouncements);
app.get('/api/admin/announcements', auth_1.authenticateJWT, auth_1.requireAdmin, announcements_1.adminGetAnnouncements);
app.post('/api/admin/announcements', auth_1.authenticateJWT, auth_1.requireAdmin, announcements_1.adminCreateAnnouncement);
app.put('/api/admin/announcements/:id', auth_1.authenticateJWT, auth_1.requireAdmin, announcements_1.adminUpdateAnnouncement);
app.delete('/api/admin/announcements/:id', auth_1.authenticateJWT, auth_1.requireAdmin, announcements_1.adminDeleteAnnouncement);
// --- 404 Route ---
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});
// Start Express Server
app.listen(PORT, () => {
    console.log(`[Server] MisrGate API listening on port ${PORT}`);
});
