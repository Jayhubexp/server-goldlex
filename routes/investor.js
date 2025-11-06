import express from "express";
import Investor from "../models/Investor.js";
import { sendEmail } from "../utils/notify.js";

const router = express.Router();

// Create investor
router.post("/", async (req, res, next) => {
	try {
		const investor = new Investor(req.body);
		await investor.save();

		// --- NEW: Send email notification ---
		try {
			const emailRecipient = process.env.NOTIFY_EMAIL;
			if (emailRecipient) {
				const { name, email, phoneNumber, investmentAmount, occupation, city } =
					req.body;
				const subject = `New Investor Signup: ${name}`;
				const text = `A new investor has registered:\n
Name: ${name}
Email: ${email}
Phone Number: ${phoneNumber}
City: ${city}
Occupation: ${occupation}
Investment Amount: ${investmentAmount}
        `;
				await sendEmail(emailRecipient, subject, text);
			}
		} catch (emailError) {
			console.error("Failed to send investor signup email:", emailError);
			// Do not fail the request, just log the email error
		}
		// --- END of email notification ---

		res.status(201).json({
			success: true,
			message: "Investor registered successfully",
			data: investor,
		});
	} catch (error) {
		next(error); // --- MODIFIED: Pass to central error handler
	}
});

// Get all investors
router.get("/", async (req, res, next) => {
	// --- MODIFIED: Added next ---
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const [investors, total] = await Promise.all([
			Investor.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			Investor.countDocuments(),
		]);

		res.status(200).json({
			success: true,
			data: investors,
			pagination: {
				current: page,
				pages: Math.ceil(total / limit),
				total,
			},
		});
	} catch (error) {
		// res.status(500).json({ ... });
		next(error); // --- MODIFIED: Pass to central error handler
	}
});

export default router;

// import express from "express";
// import Investor from "../models/Investor.js";

// const router = express.Router();

// // Create investor
// router.post("/", async (req, res) => {
// 	try {
// 		const investor = new Investor(req.body);
// 		await investor.save();

// 		res.status(201).json({
// 			success: true,
// 			message: "Investor registered successfully",
// 			data: investor,
// 		});
// 	} catch (error) {
// 		res.status(400).json({
// 			success: false,
// 			message: error.message,
// 		});
// 	}
// });

// // Get all investors
// router.get("/", async (req, res) => {
// 	try {
// 		const page = parseInt(req.query.page) || 1;
// 		const limit = parseInt(req.query.limit) || 10;
// 		const skip = (page - 1) * limit;

// 		const [investors, total] = await Promise.all([
// 			Investor.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
// 			Investor.countDocuments(),
// 		]);

// 		res.status(200).json({
// 			success: true,
// 			data: investors,
// 			pagination: {
// 				current: page,
// 				pages: Math.ceil(total / limit),
// 				total,
// 			},
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch investors",
// 		});
// 	}
// });

// export default router;
