import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'RETURN', 'FEE'], required: true },
  description: String,
  amount: Number, // The value of the transaction
  balanceAfter: Number // The calculated balance at this point
});

const investorSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	dob: { type: Date }, // New
	nationality: { type: String }, // New
	phoneNumber: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, select: false },
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

	// Status
  isVerified: { type: Boolean, default: false }, // Admin must approve
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  
  // Financial Summary
  currentBalance: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },
  totalReturns: { type: Number, default: 0 },
  
  // The "Excel Sheet"
  transactions: [transactionSchema],
  
  createdAt: { type: Date, default: Date.now }
});



export default mongoose.model("Investor", investorSchema);
