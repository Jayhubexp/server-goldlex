import express from 'express';
import { body, validationResult } from 'express-validator';
import Car from '../models/Car.js';

const router = express.Router();

// Validation middleware for car creation/update
const validateCar = [
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Make is required')
    .isLength({ max: 50 })
    .withMessage('Make cannot exceed 50 characters'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 1900 and next year'),
  body('mileage')
    .isFloat({ min: 0 })
    .withMessage('Mileage cannot be negative'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*')
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['available', 'sold', 'reserved', 'maintenance'])
    .withMessage('Invalid status'),
  body('specifications.transmission')
    .isIn(['manual', 'automatic', 'cvt', 'semi-automatic'])
    .withMessage('Invalid transmission type'),
  body('specifications.fuelType')
    .isIn(['petrol', 'diesel', 'hybrid', 'electric', 'lpg'])
    .withMessage('Invalid fuel type'),
  body('specifications.seats')
    .optional()
    .isInt({ min: 2, max: 9 })
    .withMessage('Seats must be between 2 and 9'),
  body('specifications.drivetrain')
    .optional()
    .isIn(['fwd', 'rwd', 'awd', '4wd'])
    .withMessage('Invalid drivetrain type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

// GET /api/cars - Get all cars
router.get('/', async (req, res, next) => {
  try {
    const { 
      status, 
      make, 
      model, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get cars with pagination
    const cars = await Car.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Car.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cars,
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

// GET /api/cars/:id - Get single car
router.get('/:id', async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cars - Create new car
router.post('/', validateCar, async (req, res, next) => {
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

    const car = new Car(req.body);
    await car.save();

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cars/:id - Update car
router.put('/:id', validateCar, async (req, res, next) => {
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

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cars/:id - Delete car
router.delete('/:id', async (req, res, next) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;