import mongoose from "mongoose";

const individualCreditApplicationSchema = new mongoose.Schema(
	{
		surname: { type: String, required: true, trim: true },
		otherNames: { type: String, required: true, trim: true },
		fullName: { type: String, required: true, trim: true },
		dob: { type: Date },
		age: { type: Number },
		idType: { type: String, enum: ["voter", "ghana", "passport"] },
		idNumber: { type: String },
		maritalStatus: { type: String },
		gender: { type: String },
		employmentStatus: { type: String },
		placeOfWork: { type: String },
		phoneNumber: { type: String, required: true },
		emailAddress: { type: String, required: true },
		occupation: { type: String },
		desiredCreditAmount: { type: Number, required: true },
		reasonForFunding: { type: String },
		loanDurationMonths: { type: Number },
		bankAccountNumber: { type: String },
		bankName: { type: String },
		paySlipUrl: { type: String }, // URL from Cloudinary
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
	},
	{ timestamps: true },
);

export default mongoose.model(
	"IndividualCreditApplication",
	individualCreditApplicationSchema,
);
