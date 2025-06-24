import mongoose from "mongoose";

const carFormSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		phoneNumber: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true,
			match: [
				/^(0\d{9}|\+\d{15}|\d{10})$/,
				"Please enter a valid phone number",
			],
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please enter a valid email",
			],
			default: null,
		},
		message: {
			type: String,
			required: [true, "Message is required"],
			trim: true,
			maxlength: [1000, "Message cannot exceed 1000 characters"],
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("CarForm", carFormSchema);
