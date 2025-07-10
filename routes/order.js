import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/Order.js";

const router = express.Router();

// Validation middleware for creating orders
const validateOrder = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ max: 100 })
		.withMessage("Name cannot exceed 100 characters"),
	body("phoneNumber")
		.trim()
		.notEmpty()
		.withMessage("Phone number is required")
		.matches(/^(0\d{9}|\+\d{15}|\d{10})$/)
		.withMessage("Please enter a valid phone number"),
	body("products")
		.isArray({ min: 1 })
		.withMessage("At least one product is required"),
	body("products.*.productName")
		.trim()
		.notEmpty()
		.withMessage("Product name is required"),
	body("products.*.quantity")
		.isInt({ min: 1 })
		.withMessage("Quantity must be at least 1"),
	body("products.*.price")
		.isFloat({ min: 0 })
		.withMessage("Price cannot be negative"),
];

// POST /api/order
router.post("/", validateOrder, async (req, res, next) => {
	try {
		// Check validation results
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { name, phoneNumber, products } = req.body;

		const order = new Order({
			name,
			phoneNumber,
			products,
		});

		await order.save();

		res.status(201).json({
			success: true,
			message: "Order submitted successfully",
			data: {
				id: order._id,
				name: order.name,
				phoneNumber: order.phoneNumber,
				products: order.products,
				totalAmount: order.totalAmount,
				submittedAt: order.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
});

// GET /api/order - Get all orders (for admin)
router.get("/", async (req, res, next) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const orders = await Order.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));
		const total = await Order.countDocuments();
		res.status(200).json({
			success: true,
			data: orders,
			pagination: {
				current: parseInt(page),
				pages: Math.ceil(total / parseInt(limit)),
				total,
			},
		});
	} catch (error) {
		next(error);
	}
});

// PUT /api/order/:id - Update order status (admin only)
router.put("/:id", async (req, res, next) => {
	try {
		const { status } = req.body;

		if (!["pending", "processing", "completed", "cancelled"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status value",
			});
		}

		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true, runValidators: true },
		);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Order updated successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
});

// DELETE /api/order/:id - Delete order (admin only)
router.delete("/:id", async (req, res, next) => {
	try {
		const order = await Order.findByIdAndDelete(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Order deleted successfully",
		});
	} catch (error) {
		next(error);
	}
});

export default router;
