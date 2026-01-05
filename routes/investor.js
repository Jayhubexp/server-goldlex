import express from "express";
import Investor from "../models/Investor.js";
// Import the new function here
import { sendEmail, sendTemplateEmail } from "../utils/notify.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
	try {
		const investor = new Investor(req.body);
		await investor.save();

		// --- 1. Send Notification to YOU (Admin) ---
		try {
			const emailRecipient = process.env.NOTIFY_EMAIL;
			if (emailRecipient) {
				await sendEmail(
					emailRecipient,
					`New Investor: ${investor.name}`,
					`Amount: ${investor.investmentAmount}`
				);
			}
		} catch (e) {
			console.error("Admin notification failed:", e);
		}

		// --- 2. Send Acknowledgement to USER (Investor) ---
		try {
			// Check if we have the user's email
			if (investor.email) {
				await sendTemplateEmail(
					investor.email, // The user's email address
					"d-8c11a483e4db4a56aa45975a68d1782f", // Your Template ID
					{
						// These variables must match what you used in your SendGrid design
						// e.g., if you used {{name}} or {{first_name}}
						name: investor.name,
						investment_amount: investor.investmentAmount,
					}
				);
			}
		} catch (e) {
			console.error("User acknowledgement failed:", e);
		}

		res
			.status(201)
			.json({ success: true, message: "Investor registered", data: investor });
	} catch (error) {
		next(error);
	}
});

router.get("/", async (req, res, next) => {
	try {
		const investors = await Investor.find().sort({ createdAt: -1 });
		res.json({ success: true, data: investors });
	} catch (e) {
		next(e);
	}
});

export default router;


// import express from "express";
// import Investor from "../models/Investor.js";
// import { sendEmail, sendTemplateEmail } from "../utils/notify.js";

// const router = express.Router();

// router.post("/", async (req, res, next) => {
// 	try {
// 		const investor = new Investor(req.body);
// 		await investor.save();

// 		try {
// 			const emailRecipient = process.env.NOTIFY_EMAIL;
// 			if (emailRecipient) {
// 				await sendEmail(
// 					emailRecipient,
// 					`New Investor: ${investor.name}`,
// 					`Amount: ${investor.investmentAmount}`,
// 				);
// 			}
// 		} catch (e) {
// 			console.error(e);
// 		}

// 		res
// 			.status(201)
// 			.json({ success: true, message: "Investor registered", data: investor });
// 	} catch (error) {
// 		next(error);
// 	}
// });

// router.get("/", async (req, res, next) => {
// 	try {
// 		const investors = await Investor.find().sort({ createdAt: -1 });
// 		res.json({ success: true, data: investors });
// 	} catch (e) {
// 		next(e);
// 	}
// });

// export default router;
