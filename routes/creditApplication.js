import express from "express";
import { body, validationResult } from "express-validator";
import CreditApplication from "../models/CreditApplication.js";

const router = express.Router();

// Validation middleware
const validateCreditApplication = [
	body("businessName")
		.trim()
		.notEmpty()
		.withMessage("Business name is required")
		.isLength({ max: 200 })
		.withMessage("Business name cannot exceed 200 characters"),
	body("yearsInBusiness")
		.isFloat({ min: 0 })
		.withMessage("Years in business must be 0 or greater"),
	body("fullName")
		.trim()
		.notEmpty()
		.withMessage("Full name is required")
		.isLength({ max: 100 })
		.withMessage("Full name cannot exceed 100 characters"),
	body("phoneNumber")
		.trim()
		.notEmpty()
		.withMessage("Phone number is required")
		.matches(/^(0\d{9}|\+\d{15}|\d{10})$/)
		.withMessage("Please enter a valid phone number"),
	body("emailAddress")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("desiredCreditAmount")
		.isFloat({ min: 0 })
		.withMessage("Desired credit amount must be 0 or greater"),
	body("additionalInfo")
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage("Additional info cannot exceed 500 characters"),
];

// POST /api/credit-application
router.post("/", validateCreditApplication, async (req, res, next) => {
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

		const {
			businessName,
			yearsInBusiness,
			fullName,
			phoneNumber,
			emailAddress,
			desiredCreditAmount,
			additionalInfo,
		} = req.body;

		const creditApplication = new CreditApplication({
			businessName,
			yearsInBusiness,
			fullName,
			phoneNumber,
			emailAddress,
			desiredCreditAmount,
			additionalInfo,
		});

		await creditApplication.save();

		res.status(201).json({
			success: true,
			message: "Credit application submitted successfully",
			data: {
				id: creditApplication._id,
				businessName: creditApplication.businessName,
				fullName: creditApplication.fullName,
				emailAddress: creditApplication.emailAddress,
				desiredCreditAmount: creditApplication.desiredCreditAmount,
				submittedAt: creditApplication.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
