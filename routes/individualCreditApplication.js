import express from "express";
import IndividualCreditApplication from "../models/IndividualCreditApplication.js";
import { sendEmail } from "../utils/notify.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
	try {
		const application = new IndividualCreditApplication(req.body);
		await application.save();

		// Email Notification
		try {
			const emailRecipient = process.env.NOTIFY_EMAIL;
			if (emailRecipient) {
				const subject = `New Individual Credit Application: ${application.fullName}`;
				const text = `A new individual credit application has been submitted:\n
Name: ${application.fullName}
Amount: ${application.desiredCreditAmount}
Phone: ${application.phoneNumber}
Pay Slip: ${application.paySlipUrl || "Not uploaded"}
        `;
				await sendEmail(emailRecipient, subject, text);
			}
		} catch (e) {
			console.error("Email notification failed", e);
		}

		res.status(201).json({
			success: true,
			message: "Application submitted successfully!",
			data: application,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/", async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		const apps = await IndividualCreditApplication.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		const total = await IndividualCreditApplication.countDocuments();
		res.json({
			success: true,
			data: apps,
			pagination: { current: page, total, pages: Math.ceil(total / limit) },
		});
	} catch (e) {
		next(e);
	}
});

export default router;
