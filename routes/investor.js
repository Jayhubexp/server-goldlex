import express from "express";
import Investor from "../models/Investor.js";
import { sendEmail } from "../utils/notify.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
	try {
		const investor = new Investor(req.body);
		await investor.save();

		try {
			const emailRecipient = process.env.NOTIFY_EMAIL;
			if (emailRecipient) {
				await sendEmail(
					emailRecipient,
					`New Investor: ${investor.name}`,
					`Amount: ${investor.investmentAmount}`,
				);
			}
		} catch (e) {
			console.error(e);
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
