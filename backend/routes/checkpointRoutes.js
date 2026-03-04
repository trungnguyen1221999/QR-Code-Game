import express from 'express';
import { body } from 'express-validator';
import {
  getAllCheckpoints,
  getCheckpointById,
  getCheckpointByQrCode,
  scanQrCode,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint
} from '../controllers/checkpointController.js';

const router = express.Router();

// Validation middleware
const createCheckpointValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('level')
    .isNumeric()
    .withMessage('Level must be a number')
    .isInt({ min: 1 })
    .withMessage('Level must be greater than 0'),
  body('qrCode')
    .notEmpty()
    .withMessage('QR code is required')
];

// Routes
router.get('/', getAllCheckpoints);
router.get('/qr/:qrCode', getCheckpointByQrCode);
router.post('/scan/:qrCode', scanQrCode);
router.get('/:id', getCheckpointById);
router.post('/', createCheckpointValidation, createCheckpoint);
router.put('/:id', updateCheckpoint);
router.delete('/:id', deleteCheckpoint);

export default router;