import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/db';
import { logActivity } from '../utils/activity';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}

// In-memory token blacklist (for logout)
const tokenBlacklist = new Set<string>();

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// Schema validations using Zod
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  nationalId: z.string().length(14, 'National ID must be exactly 14 digits').regex(/^\d+$/, 'National ID must contain only digits'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?\d+$/, 'Invalid phone number format'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Extend express Request type to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'CITIZEN' | 'ADMIN';
    nationalId: string;
  };
}

// User Registration
export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Check if national ID already exists
    const existingUserById = await prisma.user.findUnique({
      where: { nationalId: validatedData.nationalId },
    });
    if (existingUserById) {
      return res.status(400).json({ error: 'National ID is already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Default first user as Admin, otherwise Citizen (for ease of testing)
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 ? 'ADMIN' : 'CITIZEN';

    // Create user in DB
    const user = await prisma.user.create({
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
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, nationalId: user.nationalId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logActivity({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration.' });
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, nationalId: user.nationalId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logActivity({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
};

// User Logout
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1];
  tokenBlacklist.add(token);

  return res.json({ message: 'Logged out successfully.' });
};

// Middleware: Authenticate Request
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ error: 'Token has been invalidated.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
      }

      req.user = decoded as AuthenticatedRequest['user'];
      next();
    });
  } else {
    return res.status(401).json({ error: 'Authorization header is missing.' });
  }
};

// Middleware: Require Admin Role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};

// Get profile details
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching profile.' });
  }
};

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?\d+$/, 'Invalid phone number format').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
});

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
      select: { id: true, email: true, name: true, nationalId: true, phone: true, role: true },
    });

    return res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'An error occurred while updating profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const validatedData = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: 'PASSWORD_CHANGE',
      details: 'User changed their password',
    });

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'An error occurred while changing password.' });
  }
};
