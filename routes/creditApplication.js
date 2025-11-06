import express from "express";
import mongoose from "mongoose";
import CreditApplication from "../models/CreditApplication.js";
import { sendEmail } from "../utils/notify.js"; // --- NEW: Import sendEmail ---

const router = express.Router();

// Create credit application
router.post("/", async (req, res, next) => {
	// --- MODIFIED: Added next ---
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

		// --- NEW: Send email notification ---
		try {
			const emailRecipient = process.env.NOTIFY_EMAIL;
			if (emailRecipient) {
				const subject = `New Credit Application: ${businessName}`;
				const text = `A new credit application has been submitted:\n
Business Name: ${businessName}
Years in Business: ${yearsInBusiness || "N/A"}
Contact Name: ${fullName}
Phone Number: ${phoneNumber}
Email: ${emailAddress}
Desired Amount: ${desiredCreditAmount}
Reason: ${additionalInfo || "N/A"}
        `;
				await sendEmail(emailRecipient, subject, text);
			}
		} catch (emailError) {
			console.error("Failed to send credit application email:", emailError);
			// Do not fail the request, just log the email error
		}
		// --- END of email notification ---

		res.status(201).json({
			success: true,
			message: "Application submitted successfully!",
			data: application,
		});
	} catch (error) {
		// res.status(500).json({ // Old error handling
		// 	success: false,
		// 	message: error.message || "Failed to submit application",
		// });
		next(error); // --- MODIFIED: Pass to central error handler
	}
});

// Get all credit applications (with pagination)
router.get("/", async (req, res, next) => {
	// --- MODIFIED: Added next ---
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
		// res.status(500).json({ ... });
		next(error); // --- MODIFIED: Pass to central error handler
	}
});

// Update application status
router.put("/:id", async (req, res, next) => {
	// --- MODIFIED: Added next ---
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
		// res.status(500).json({ ... });
		next(error); // --- MODIFIED: Pass to central error handler
	}
});

export default router;

// import express from "express";
// import mongoose from "mongoose";
// import CreditApplication from "../models/CreditApplication.js";

// const router = express.Router();

// // Create credit application
// router.post("/", async (req, res) => {
// 	try {
// 		const {
// 			businessName,
// 			yearsInBusiness,
// 			fullName,
// 			phoneNumber,
// 			emailAddress,
// 			desiredCreditAmount,
// 			additionalInfo,
// 		} = req.body;

// 		const application = new CreditApplication({
// 			businessName,
// 			yearsInBusiness: yearsInBusiness || undefined,
// 			fullName,
// 			phoneNumber,
// 			emailAddress,
// 			desiredCreditAmount,
// 			additionalInfo: additionalInfo || undefined,
// 		});

// 		await application.save();

// 		res.status(201).json({
// 			success: true,
// 			message: "Application submitted successfully!",
// 			data: application,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: error.message || "Failed to submit application",
// 		});
// 	}
// });

// // Get all credit applications (with pagination)
// router.get("/", async (req, res) => {
// 	try {
// 		const page = parseInt(req.query.page) || 1;
// 		const limit = parseInt(req.query.limit) || 10;
// 		const skip = (page - 1) * limit;

// 		const [applications, total] = await Promise.all([
// 			CreditApplication.find()
// 				.sort({ createdAt: -1 })
// 				.skip(skip)
// 				.limit(limit)
// 				.lean(),
// 			CreditApplication.countDocuments(),
// 		]);

// 		const pages = Math.ceil(total / limit);

// 		res.status(200).json({
// 			success: true,
// 			data: applications,
// 			pagination: {
// 				current: page,
// 				pages,
// 				total,
// 			},
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: error.message || "Failed to fetch applications",
// 		});
// 	}
// });

// // Update application status
// router.put("/:id", async (req, res) => {
// 	try {
// 		const { id } = req.params;
// 		const { status } = req.body;

// 		if (!["pending", "approved", "rejected"].includes(status)) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Invalid status value",
// 			});
// 		}

// 		const updatedApplication = await CreditApplication.findByIdAndUpdate(
// 			id,
// 			{ status },
// 			{ new: true },
// 		);

// 		if (!updatedApplication) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Application not found",
// 			});
// 		}

// 		res.status(200).json({
// 			success: true,
// 			message: "Application status updated successfully",
// 			data: updatedApplication,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: error.message || "Failed to update application status",
// 		});
// 	}
// });

// export default router;
