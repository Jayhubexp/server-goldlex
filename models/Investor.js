import mongoose from "mongoose";

const investorSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	dob: { type: Date }, // New
	nationality: { type: String }, // New
	phoneNumber: { type: String, required: true },
	email: { type: String, required: true },
	occupation: { type: String, required: true },
	sourceOfFunds: { type: String }, // New
	city: { type: String, required: true },

	idType: { type: String }, // New
	idNumber: { type: String }, // New

	nextOfKinName: { type: String }, // New
	nextOfKinPhone: { type: String }, // New

	bankName: { type: String }, // New (for returns)
	bankAccountNumber: { type: String }, // New

	investmentAmount: { type: Number, required: true, min: 5000 },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Investor", investorSchema);
