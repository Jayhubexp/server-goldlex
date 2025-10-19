import express from "express";
import { body, validationResult } from "express-validator";
import Car from "../models/Car.js";
import mongoose from "mongoose";

const router = express.Router();

// Validation middleware for car creation/update
const validateCar = [
	body("make")
		.trim()
		.notEmpty()
		.withMessage("Make is required")
		.isLength({ max: 50 })
		.withMessage("Make cannot exceed 50 characters"),
	body("model")
		.trim()
		.notEmpty()
		.withMessage("Model is required")
		.isLength({ max: 50 })
		.withMessage("Model cannot exceed 50 characters"),
	body("year")
		.isInt({ min: 1900, max: new Date().getFullYear() + 1 })
		.withMessage("Year must be between 1900 and next year"),
	body("mileage").isFloat({ min: 0 }).withMessage("Mileage cannot be negative"),
	body("price")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0 })
		.withMessage("Price cannot be negative"),
	body("images")
		.isArray({ min: 1 })
		.withMessage("At least one image is required"),
	body("images.*")
		.isString()
		.withMessage("Each image must be a string URL or path"),
	body("specifications.color")
		.trim()
		.notEmpty()
		.withMessage("Color is required")
		.isLength({ max: 30 })
		.withMessage("Color cannot exceed 30 characters"),
	body("specifications.features")
		.optional()
		.isArray()
		.withMessage("Features must be an array"),
];

// GET /api/cars - Get all cars
router.get("/", async (req, res, next) => {
	try {
		const {
			make,
			model,
			minPrice,
			maxPrice,
			page = 1,
			limit = 12,
			sortBy = "createdAt",
			sortOrder = "desc",
			gid,
		} = req.query;

		const filter = {};
		if (make) filter.make = new RegExp(make, "i");
		if (model) filter.model = new RegExp(model, "i");
		if (gid) filter.gid = new RegExp(gid, "i");
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = parseFloat(minPrice);
			if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

		const cars = await Car.find(filter)
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));
		const total = await Car.countDocuments(filter);

		const carsWithId = cars.map((car) => ({
			...car.toObject(),
			id: car.gid || car._id,
		}));

		res.status(200).json({
			success: true,
			data: carsWithId,
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

// GET /api/cars/:id - Get single car
router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		let car = null;

		// Try to find by GID first (7-digit string), then by ObjectId
		if (id && id.length === 7) {
			car = await Car.findOne({ gid: id });
		}

		if (!car) {
			// If id is a valid ObjectId, try that
			if (mongoose.Types.ObjectId.isValid(id)) {
				car = await Car.findById(id);
			}
			// As a last resort, try numeric id (carId) if present in schema
			if (!car && /^\d+$/.test(id)) {
				car = await Car.findOne({ carId: parseInt(id) });
			}
		}

		if (!car) {
			return res.status(404).json({ success: false, message: "Car not found" });
		}

		const carWithId = { ...car.toObject(), id: car.gid || car._id };
		res.status(200).json({ success: true, data: carWithId });
	} catch (error) {
		next(error);
	}
});

// POST /api/cars - Create new car
router.post("/", validateCar, async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({
					success: false,
					message: "Validation failed",
					errors: errors.array(),
				});
		}

		const car = new Car(req.body);
		await car.save();
		const carWithId = { ...car.toObject(), id: car.gid || car._id };

		res
			.status(201)
			.json({
				success: true,
				message: "Car created successfully",
				data: carWithId,
			});
	} catch (error) {
		next(error);
	}
});

// PUT /api/cars/:id - Update car
router.put("/:id", validateCar, async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({
					success: false,
					message: "Validation failed",
					errors: errors.array(),
				});
		}

		const { id } = req.params;
		let updated = null;

		// Try updating by gid
		if (id && id.length === 7) {
			updated = await Car.findOneAndUpdate({ gid: id }, req.body, {
				new: true,
				runValidators: true,
			});
		}

		if (!updated) {
			if (mongoose.Types.ObjectId.isValid(id)) {
				updated = await Car.findByIdAndUpdate(id, req.body, {
					new: true,
					runValidators: true,
				});
			}
			if (!updated && /^\d+$/.test(id)) {
				updated = await Car.findOneAndUpdate(
					{ carId: parseInt(id) },
					req.body,
					{ new: true, runValidators: true },
				);
			}
		}

		if (!updated) {
			return res.status(404).json({ success: false, message: "Car not found" });
		}

		const carWithId = { ...updated.toObject(), id: updated.gid || updated._id };
		res
			.status(200)
			.json({
				success: true,
				message: "Car updated successfully",
				data: carWithId,
			});
	} catch (error) {
		next(error);
	}
});

// DELETE /api/cars/:id - Delete car
router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		let deleted = null;

		if (id && id.length === 7) {
			deleted = await Car.findOneAndDelete({ gid: id });
		}

		if (!deleted) {
			if (mongoose.Types.ObjectId.isValid(id)) {
				deleted = await Car.findByIdAndDelete(id);
			}
			if (!deleted && /^\d+$/.test(id)) {
				deleted = await Car.findOneAndDelete({ carId: parseInt(id) });
			}
		}

		if (!deleted) {
			return res.status(404).json({ success: false, message: "Car not found" });
		}

		res
			.status(200)
			.json({ success: true, message: "Car deleted successfully" });
	} catch (error) {
		next(error);
	}
});

export default router;

 

