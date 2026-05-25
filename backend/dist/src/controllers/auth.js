"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.requireAdmin = exports.authenticateJWT = exports.logout = exports.login = exports.register = exports.loginSchema = exports.registerSchema = void 0;
exports.isTokenBlacklisted = isTokenBlacklisted;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../utils/db"));
const activity_1 = require("../utils/activity");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required.');
}
// In-memory token blacklist (for logout)
const tokenBlacklist = new Set();
function isTokenBlacklisted(token) {
    return tokenBlacklist.has(token);
}
// Schema validations using Zod
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
    nationalId: zod_1.z.string().length(14, 'National ID must be exactly 14 digits').regex(/^\d+$/, 'National ID must contain only digits'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?\d+$/, 'Invalid phone number format'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// User Registration
const register = async (req, res) => {
    try {
        const validatedData = exports.registerSchema.parse(req.body);
        // Check if user email already exists
        const existingUserByEmail = await db_1.default.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUserByEmail) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }
        // Check if national ID already exists
        const existingUserById = await db_1.default.user.findUnique({
            where: { nationalId: validatedData.nationalId },
        });
        if (existingUserById) {
            return res.status(400).json({ error: 'National ID is already registered.' });
        }
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
        // Default first user as Admin, otherwise Citizen (for ease of testing)
        const totalUsers = await db_1.default.user.count();
        const role = totalUsers === 0 ? 'ADMIN' : 'CITIZEN';
        // Create user in DB
        const user = await db_1.default.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                nationalId: validatedData.nationalId,
                phone: validatedData.phone,
                role: role,
            },
        });
        // Create JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role, nationalId: user.nationalId }, JWT_SECRET, { expiresIn: '24h' });
        await (0, activity_1.logActivity)({
            userId: user.id,
            userName: user.name,
            action: 'USER_REGISTER',
            details: `New user registered: ${user.email} (${user.role})`,
        });
        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                nationalId: user.nationalId,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'An error occurred during registration.' });
    }
};
exports.register = register;
// User Login
const login = async (req, res) => {
    try {
        const validatedData = exports.loginSchema.parse(req.body);
        const user = await db_1.default.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        // Create JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role, nationalId: user.nationalId }, JWT_SECRET, { expiresIn: '24h' });
        await (0, activity_1.logActivity)({
            userId: user.id,
            userName: user.name,
            action: 'USER_LOGIN',
            details: `User logged in: ${user.email}`,
        });
        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                nationalId: user.nationalId,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Login error:', error);
        return res.status(500).json({ error: 'An error occurred during login.' });
    }
};
exports.login = login;
// User Logout
const logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing.' });
    }
    const token = authHeader.split(' ')[1];
    tokenBlacklist.add(token);
    return res.json({ message: 'Logged out successfully.' });
};
exports.logout = logout;
// Middleware: Authenticate Request
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({ error: 'Token has been invalidated.' });
        }
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token.' });
            }
            req.user = decoded;
            next();
        });
    }
    else {
        return res.status(401).json({ error: 'Authorization header is missing.' });
    }
};
exports.authenticateJWT = authenticateJWT;
// Middleware: Require Admin Role
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    else {
        res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
};
exports.requireAdmin = requireAdmin;
// Get profile details
const getProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                nationalId: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'An error occurred while fetching profile.' });
    }
};
exports.getProfile = getProfile;
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?\d+$/, 'Invalid phone number format').optional(),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'New password must contain at least one number'),
});
const updateProfile = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const validatedData = updateProfileSchema.parse(req.body);
        const updatedUser = await db_1.default.user.update({
            where: { id: req.user.id },
            data: validatedData,
            select: { id: true, email: true, name: true, nationalId: true, phone: true, role: true },
        });
        return res.json({ message: 'Profile updated successfully.', user: updatedUser });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'An error occurred while updating profile.' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const validatedData = changePasswordSchema.parse(req.body);
        const user = await db_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: 'User not found.' });
        const isMatch = await bcryptjs_1.default.compare(validatedData.currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.newPassword, 10);
        await db_1.default.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });
        await (0, activity_1.logActivity)({
            userId: user.id,
            userName: user.name,
            action: 'PASSWORD_CHANGE',
            details: 'User changed their password',
        });
        return res.json({ message: 'Password changed successfully.' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'An error occurred while changing password.' });
    }
};
exports.changePassword = changePassword;
