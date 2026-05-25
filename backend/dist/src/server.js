"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./controllers/auth");
const applications_1 = require("./controllers/applications");
// Initialize dotenv configuration
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Allow development requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
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
app.get('/api/auth/profile', auth_1.authenticateJWT, auth_1.getProfile);
// --- Application Routes (Citizens) ---
app.post('/api/applications', auth_1.authenticateJWT, applications_1.createApplication);
app.get('/api/applications/my-applications', auth_1.authenticateJWT, applications_1.getMyApplications);
app.get('/api/applications/track/:trackingCode', applications_1.trackApplication);
// --- Admin Control Routes ---
app.get('/api/admin/applications', auth_1.authenticateJWT, auth_1.requireAdmin, applications_1.adminGetApplications);
app.put('/api/admin/applications/:id/status', auth_1.authenticateJWT, auth_1.requireAdmin, applications_1.adminUpdateStatus);
app.get('/api/admin/stats', auth_1.authenticateJWT, auth_1.requireAdmin, applications_1.adminGetStats);
// --- 404 Route ---
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});
// Start Express Server
app.listen(PORT, () => {
    console.log(`[Server] MisrGate API listening on port ${PORT}`);
});
