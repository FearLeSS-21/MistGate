import path from 'path';
import { Response } from 'express';
import { AuthenticatedRequest } from './auth';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.pdf']);

export const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const ext = path.extname(file.filename).toLowerCase();
    if (!ALLOWED_TYPES.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, PDF.' });
    }

    return res.json({
      message: 'File uploaded successfully.',
      url: `/uploads/${file.filename}`,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'An error occurred during upload.' });
  }
};
