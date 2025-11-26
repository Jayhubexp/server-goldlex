import mongoose from "mongoose";

const creditApplicationSchema = new mongoose.Schema(
	{
		businessName: { type: String, required: true, trim: true },
		yearsInBusiness: { type: Number },
		// New detailed fields
		registrationNumber: { type: String, trim: true },
		businessType: { type: String, trim: true }, // e.g., Sole Prop, LLC
		businessAddress: { type: String, trim: true },
		industry: { type: String, trim: true },
		averageMonthlyRevenue: { type: Number },

		fullName: { type: String, required: true, trim: true }, // Contact Person
		phoneNumber: { type: String, required: true },
		emailAddress: { type: String, required: true },

		bankName: { type: String, trim: true },
		bankAccountNumber: { type: String, trim: true },

		guarantorName: { type: String, trim: true },
		guarantorPhone: { type: String, trim: true },

		desiredCreditAmount: { type: Number, required: true },
		additionalInfo: { type: String }, // Reason for funding
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
	},
	{ timestamps: true },
);

export default mongoose.model("CreditApplication", creditApplicationSchema);
