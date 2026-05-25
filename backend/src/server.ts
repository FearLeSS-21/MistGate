import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import {
  register,
  login,
  getProfile,
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

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // Allow development requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

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
app.get('/api/auth/profile', authenticateJWT, getProfile);

// --- Application Routes (Citizens) ---
app.post('/api/applications', authenticateJWT, createApplication);
app.get('/api/applications/my-applications', authenticateJWT, getMyApplications);
app.get('/api/applications/track/:trackingCode', trackApplication);

// --- Admin Control Routes ---
app.get('/api/admin/applications', authenticateJWT, requireAdmin, adminGetApplications);
app.put('/api/admin/applications/:id/status', authenticateJWT, requireAdmin, adminUpdateStatus);
app.get('/api/admin/stats', authenticateJWT, requireAdmin, adminGetStats);

// --- 404 Route ---
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server] MisrGate API listening on port ${PORT}`);
});
