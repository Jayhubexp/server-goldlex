import mongoose from "mongoose";
import Counter from "./Counter.js";

const carSchema = new mongoose.Schema(
	{
		make: {
			type: String,
			required: [true, "Make is required"],
			trim: true,
			maxlength: [50, "Make cannot exceed 50 characters"],
		},
		model: {
			type: String,
			required: [true, "Model is required"],
			trim: true,
			maxlength: [50, "Model cannot exceed 50 characters"],
		},
		year: {
			type: Number,
			required: [true, "Year is required"],
			min: [1900, "Year must be 1900 or later"],
			max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
		},
		mileage: {
			type: Number,
			required: [true, "Mileage is required"],
			min: [0, "Mileage cannot be negative"],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		images: [
			{
				type: String,
				required: true,
			},
		],
		status: {
			type: String,
			enum: ["available", "sold", "reserved", "maintenance"],
			default: "available",
		},
		specifications: {
			engine: {
				type: String,
				trim: true,
				maxlength: [100, "Engine specification cannot exceed 100 characters"],
			},
			transmission: {
				type: String,
				enum: ["manual", "automatic", "cvt", "semi-automatic"],
				required: [true, "Transmission is required"],
			},
			fuelType: {
				type: String,
				enum: ["petrol", "diesel", "hybrid", "electric", "lpg"],
				required: [true, "Fuel type is required"],
			},
			color: {
				type: String,
				trim: true,
				maxlength: [30, "Color cannot exceed 30 characters"],
			},
			seats: {
				type: Number,
				min: [2, "Must have at least 2 seats"],
				max: [9, "Cannot have more than 9 seats"],
			},
			drivetrain: {
				type: String,
				enum: ["fwd", "rwd", "awd", "4wd"],
			},
			vin: {
				type: String,
				trim: true,
				unique: true,
				sparse: true,
				maxlength: [17, "VIN cannot exceed 17 characters"],
			},
			features: [
				{
					type: String,
					trim: true,
				},
			],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [1000, "Description cannot exceed 1000 characters"],
		},
		carId: {
			type: Number,
			unique: true,
			index: true,
		},
	},
	{
		timestamps: true,
	},
);

// Create compound index for efficient searching
carSchema.index({ make: 1, model: 1, year: 1 });
carSchema.index({ status: 1 });
carSchema.index({ price: 1 });

// Auto-increment carId before saving a new car
carSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findByIdAndUpdate(
			"carId",
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true },
		);
		this.carId = counter.seq;
	}
	next();
});

export default mongoose.model("Car", carSchema);
