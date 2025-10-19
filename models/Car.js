import mongoose from "mongoose";

async function generateUniqueGid() {
	let gid;
	let isUnique = false;

	// Get a reference to the Car model
	const Car = mongoose.model("Car");

	while (!isUnique) {
		// Generate a random 7-digit number (from 1000000 to 9999999)
		gid = Math.floor(Math.random() * 9000000) + 1000000;

		// Check if a car with this GID already exists
		const existing = await Car.findOne({ gid: gid.toString() });

		if (!existing) {
			isUnique = true; // We found a unique ID
		}
		// If 'existing' is found, the loop will run again
	}
	return gid.toString();
}

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
			min: [0, "Price cannot be negative"],
		},
		images: [
			{
				type: String,
				required: true,
			},
		],
		specifications: {
			color: {
				type: String,
				required: [true, "Color is required"],
				trim: true,
				maxlength: [30, "Color cannot exceed 30 characters"],
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
		gid: {
			type: String, // Keep as String for flexibility (e.g., padding with 0s)
			unique: true,
			index: true,
			// 'uppercase' is no longer needed
		},
	},
	{
		timestamps: true,
	},
);

// Create compound index for efficient searching
carSchema.index({ make: 1, model: 1, year: 1 });
carSchema.index({ price: 1 });

// UPDATED: Auto-generate GID before saving (now async)
carSchema.pre("save", async function (next) {
	if (this.isNew && !this.gid) {
		this.gid = await generateUniqueGid();
	}
	next();
});

export default mongoose.model("Car", carSchema);
