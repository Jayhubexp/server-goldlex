import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';

const router = express.Router();

// Validation middleware for creating orders
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
    .withMessage('Price cannot be negative'),
  body('creditRequested')
    .optional()
    .isBoolean()
    .withMessage('Credit requested must be a boolean value')
];

// GET /api/order - Get all orders (for admin)
router.get('/', async (req, res, next) => {
  try {
    const { creditRequested, status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (creditRequested !== undefined) {
      filter.creditRequested = creditRequested === 'true';
    }
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/order/:id - Get single order
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/order - Create new order
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

    const { name, email, products, creditRequested = false } = req.body;

    const order = new Order({
      name,
      email,
      products,
      creditRequested
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
        creditRequested: order.creditRequested,
        status: order.status,
        submittedAt: order.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/order/:id - Update order status (admin only)
router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/order/:id - Delete order (admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;