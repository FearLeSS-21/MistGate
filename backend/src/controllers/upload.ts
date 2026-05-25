import { Response } from 'express';
import { AuthenticatedRequest } from './auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, PDF.' });
    }

    const url = `/uploads/${file.filename}`;

    return res.json({
      message: 'File uploaded successfully.',
      url,
      originalName: file.originalname,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'An error occurred during upload.' });
  }
};
