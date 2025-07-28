import express from "express";
import mongoose from "mongoose";
import CreditApplication from "../models/CreditApplication.js";

const router = express.Router();

// Create credit application
router.post("/", async (req, res) => {
	try {
		const {
			businessName,
			yearsInBusiness,
			fullName,
			phoneNumber,
			emailAddress,
			desiredCreditAmount,
			additionalInfo,
		} = req.body;

		const application = new CreditApplication({
			businessName,
			yearsInBusiness: yearsInBusiness || undefined,
			fullName,
			phoneNumber,
			emailAddress,
			desiredCreditAmount,
			additionalInfo: additionalInfo || undefined,
		});

		await application.save();

		res.status(201).json({
			success: true,
			message: "Application submitted successfully!",
			data: application,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message || "Failed to submit application",
		});
	}
});

// Get all credit applications (with pagination)
router.get("/", async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const [applications, total] = await Promise.all([
			CreditApplication.find()
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			CreditApplication.countDocuments(),
		]);

		const pages = Math.ceil(total / limit);

		res.status(200).json({
			success: true,
			data: applications,
			pagination: {
				current: page,
				pages,
				total,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch applications",
		});
	}
});

// Update application status
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!["pending", "approved", "rejected"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status value",
			});
		}

		const updatedApplication = await CreditApplication.findByIdAndUpdate(
			id,
			{ status },
			{ new: true },
		);

		if (!updatedApplication) {
			return res.status(404).json({
				success: false,
				message: "Application not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Application status updated successfully",
			data: updatedApplication,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message || "Failed to update application status",
		});
	}
});

export default router;

// import express from "express";
// import { body, validationResult } from "express-validator";
// import CreditApplication from "../models/CreditApplication.js";

// const router = express.Router();

// // Validation middleware
// const validateCreditApplication = [
// 	body("businessName")
// 		.trim()
// 		.notEmpty()
// 		.withMessage("Business name is required")
// 		.isLength({ max: 200 })
// 		.withMessage("Business name cannot exceed 200 characters"),
// 	body("yearsInBusiness")
// 		.isFloat({ min: 0 })
// 		.withMessage("Years in business must be 0 or greater"),
// 	body("fullName")
// 		.trim()
// 		.notEmpty()
// 		.withMessage("Full name is required")
// 		.isLength({ max: 100 })
// 		.withMessage("Full name cannot exceed 100 characters"),
// 	body("phoneNumber")
// 		.trim()
// 		.notEmpty()
// 		.withMessage("Phone number is required")
// 		.matches(/^(0\d{9}|\+\d{15}|\d{10})$/)
// 		.withMessage("Please enter a valid phone number"),
// 	body("emailAddress")
// 		.trim()
// 		.isEmail()
// 		.withMessage("Please enter a valid email")
// 		.normalizeEmail(),
// 	body("desiredCreditAmount")
// 		.isFloat({ min: 0 })
// 		.withMessage("Desired credit amount must be 0 or greater"),
// 	body("additionalInfo")
// 		.optional()
// 		.trim()
// 		.isLength({ max: 500 })
// 		.withMessage("Additional info cannot exceed 500 characters"),
// ];

// // POST /api/credit-application
// router.post("/", validateCreditApplication, async (req, res, next) => {
// 	try {
// 		// Check validation results
// 		const errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Validation failed",
// 				errors: errors.array(),
// 			});
// 		}

// 		const {
// 			businessName,
// 			yearsInBusiness,
// 			fullName,
// 			phoneNumber,
// 			emailAddress,
// 			desiredCreditAmount,
// 			additionalInfo,
// 		} = req.body;

// 		const creditApplication = new CreditApplication({
// 			businessName,
// 			yearsInBusiness,
// 			fullName,
// 			phoneNumber,
// 			emailAddress,
// 			desiredCreditAmount,
// 			additionalInfo,
// 		});

// 		await creditApplication.save();

// 		res.status(201).json({
// 			success: true,
// 			message: "Credit application submitted successfully",
// 			data: {
// 				id: creditApplication._id,
// 				businessName: creditApplication.businessName,
// 				fullName: creditApplication.fullName,
// 				emailAddress: creditApplication.emailAddress,
// 				desiredCreditAmount: creditApplication.desiredCreditAmount,
// 				submittedAt: creditApplication.createdAt,
// 			},
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// });

// export default router;
