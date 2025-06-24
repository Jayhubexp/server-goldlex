import mongoose from "mongoose";

const creditApplicationSchema = new mongoose.Schema(
	{
		businessName: {
			type: String,
			required: [true, "Business name is required"],
			trim: true,
			maxlength: [200, "Business name cannot exceed 200 characters"],
		},
		yearsInBusiness: {
			type: Number, // Corrected: Made optional to match frontend behavior (sending undefined/null for empty) // If you intend it to be strictly required, then frontend must send 0 if nothing is entered.
			min: [0, "Years in business cannot be negative"], // Mongoose automatically considers undefined/null as valid for non-required fields. // If you want to explicitly accept empty string, you might handle it in middleware or controller // to convert '' to null/undefined before passing to Mongoose.
		},
		fullName: {
			type: String,
			required: [true, "Full name is required"],
			trim: true,
			maxlength: [100, "Full name cannot exceed 100 characters"],
		},
		phoneNumber: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true, // Corrected regex: // ^
			match: [
				/^(0\d{9}|\+\d{15}|\d{10})$/,
				"Please enter a valid phone number (10 digits starting with 0, or 15 digits starting with +)",
			],
		},
		emailAddress: {
			type: String,
			required: [true, "Email address is required"],
			trim: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please enter a valid email",
			],
		},
		desiredCreditAmount: {
			type: Number,
			required: [true, "Desired credit amount is required"],
			min: [0, "Credit amount cannot be negative"],
		},
		additionalInfo: {
			type: String,
			trim: true,
			maxlength: [500, "Additional info cannot exceed 500 characters"],
		},
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt fields
	},
);

export default mongoose.model("CreditApplication", creditApplicationSchema);

// import mongoose from "mongoose";

// const creditApplicationSchema = new mongoose.Schema(
// 	{
// 		businessName: {
// 			type: String,
// 			required: [true, "Business name is required"],
// 			trim: true,
// 			maxlength: [200, "Business name cannot exceed 200 characters"],
// 		},
// 		yearsInBusiness: {
// 			type: Number,
// 			required: [true, "Years in business is required"],
// 			min: [0, "Years in business cannot be negative"],
// 		},
// 		fullName: {
// 			type: String,
// 			required: [true, "Full name is required"],
// 			trim: true,
// 			maxlength: [100, "Full name cannot exceed 100 characters"],
// 		},
// 		phoneNumber: {
// 			type: String,
// 			required: [true, "Phone number is required"],
// 			trim: true,
// 			match: [/^(0\d{9}|\+\d{15})$/, "Please enter a valid phone number"],
// 		},
// 		emailAddress: {
// 			type: String,
// 			required: [true, "Email address is required"],
// 			trim: true,
// 			lowercase: true,
// 			match: [
// 				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
// 				"Please enter a valid email",
// 			],
// 		},
// 		desiredCreditAmount: {
// 			type: Number,
// 			required: [true, "Desired credit amount is required"],
// 			min: [0, "Credit amount cannot be negative"],
// 		},
// 		additionalInfo: {
// 			type: String,
// 			trim: true,
// 			maxlength: [500, "Additional info cannot exceed 500 characters"],
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	},
// );

// export default mongoose.model("CreditApplication", creditApplicationSchema);
