import express from 'express';
import { body } from 'express-validator';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';

const router = express.Router();

// Validation middleware
const createItemValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('desc')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0')
];

// Routes
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', createItemValidation, createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;