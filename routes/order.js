import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  body('products.*.productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('products.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative')
];

// POST /api/order
router.post('/', validateOrder, async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, products } = req.body;

    const order = new Order({
      name,
      email,
      products
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order submitted successfully',
      data: {
        id: order._id,
        name: order.name,
        email: order.email,
        products: order.products,
        totalAmount: order.totalAmount,
        submittedAt: order.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;