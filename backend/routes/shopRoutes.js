import express from 'express';
import { body } from 'express-validator';
import {
  getAllShops,
  getShopById,
  getShopsByCheckpointLevel,
  createShop,
  updateShop,
  deleteShop,
  addItemToShop,
  removeItemFromShop
} from '../controllers/shopController.js';

const router = express.Router();

// Validation middleware
const createShopValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  body('checkpointLevel')
    .isNumeric()
    .withMessage('Checkpoint level must be a number')
    .isInt({ min: 1 })
    .withMessage('Checkpoint level must be greater than 0')
];

// Routes
router.get('/', getAllShops);
router.get('/checkpoint/:level', getShopsByCheckpointLevel);
router.get('/:id', getShopById);
router.post('/', createShopValidation, createShop);
router.put('/:id', updateShop);
router.delete('/:id', deleteShop);
router.post('/:id/items/:itemId', addItemToShop);
router.delete('/:id/items/:itemId', removeItemFromShop);

export default router;