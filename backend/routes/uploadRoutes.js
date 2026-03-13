import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload/avatar
router.post('/avatar', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' });

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'avatars', transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }] },
    (error, result) => {
      if (error) return res.status(500).json({ message: error.message });
      res.json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

export default router;
