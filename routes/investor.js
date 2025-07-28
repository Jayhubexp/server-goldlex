import express from "express";
import Investor from "../models/Investor.js";

const router = express.Router();

// Create investor
router.post("/", async (req, res) => {
	try {
		const investor = new Investor(req.body);
		await investor.save();

		res.status(201).json({
			success: true,
			message: "Investor registered successfully",
			data: investor,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
});

// Get all investors
router.get("/", async (req, res) => {
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
		res.status(500).json({
			success: false,
			message: "Failed to fetch investors",
		});
	}
});

export default router;
