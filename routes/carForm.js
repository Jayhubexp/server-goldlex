import express from "express";
import { body, validationResult } from "express-validator";
import CarForm from "../models/CarForm.js";

const router = express.Router();

// Validation middleware
const validateCarForm = [
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
	body("email")
		.optional()
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("message")
		.trim()
		.notEmpty()
		.withMessage("Message is required")
		.isLength({ max: 1000 })
		.withMessage("Message cannot exceed 1000 characters"),
];

// POST /api/car-form
router.post("/", validateCarForm, async (req, res, next) => {
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

		const { name, phoneNumber, email, message } = req.body;

		const carForm = new CarForm({
			name,
			phoneNumber,
			email,
			message,
		});

		await carForm.save();

		res.status(201).json({
			success: true,
			message: "Car form submitted successfully",
			data: {
				id: carForm._id,
				name: carForm.name,
				phoneNumber: carForm.phoneNumber,
				email: carForm.email,
				submittedAt: carForm.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
