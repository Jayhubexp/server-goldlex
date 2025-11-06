import mongoose from "mongoose";

const investorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Investor name is required"],
		trim: true,
		maxlength: [100, "Name cannot exceed 100 characters"],
	},
	phoneNumber: {
		type: String,
		required: [true, "Phone number is required"],
		trim: true,
		match: [/^(0\d{9}|\+\d{15}|\d{10})$/, "Please enter a valid phone number"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		trim: true,
		lowercase: true,
		match: [
			/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
			"Please enter a valid email",
		],
	},
	occupation: {
		type: String,
		required: [true, "Occupation is required"],
		trim: true,
	},
	city: {
		type: String,
		required: [true, "City is required"],
		trim: true,
	},
	investmentAmount: {
		type: Number,
		required: [true, "Investment amount is required"],
		min: [1000, "Minimum investment is 1000"],
	},
	expectedROI: {
		type: String,
		required: false, // <-- MODIFIED: Set to false
		trim: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Create model if it doesn't exist, otherwise use existing
const Investor =
	mongoose.models.Investor || mongoose.model("Investor", investorSchema);

export default Investor;

// import mongoose from "mongoose";

// const investorSchema = new mongoose.Schema({
// 	name: {
// 		type: String,
// 		required: [true, "Investor name is required"],
// 		trim: true,
// 		maxlength: [100, "Name cannot exceed 100 characters"],
// 	},
// 	phoneNumber: {
// 		type: String,
// 		required: [true, "Phone number is required"],
// 		trim: true,
// 		match: [/^(0\d{9}|\+\d{15}|\d{10})$/, "Please enter a valid phone number"],
// 	},
// 	email: {
// 		type: String,
// 		required: [true, "Email is required"],
// 		trim: true,
// 		lowercase: true,
// 		match: [
// 			/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
// 			"Please enter a valid email",
// 		],
// 	},
// 	occupation: {
// 		type: String,
// 		required: [true, "Occupation is required"],
// 		trim: true,
// 	},
// 	city: {
// 		type: String,
// 		required: [true, "City is required"],
// 		trim: true,
// 	},
// 	investmentAmount: {
// 		type: Number,
// 		required: [true, "Investment amount is required"],
// 		min: [1000, "Minimum investment is 1000"],
// 	},
// 	expectedROI: {
// 		type: String,
// 		required: [true, "Expected ROI is required"],
// 		enum: {
// 			values: ["Monthly", "Quarterly", "Annually"],
// 			message: "Invalid ROI type",
// 		},
// 	},
// 	createdAt: {
// 		type: Date,
// 		default: Date.now,
// 	},
// });

// // Create model if it doesn't exist, otherwise use existing
// const Investor =
// 	mongoose.models.Investor || mongoose.model("Investor", investorSchema);

// export default Investor;
