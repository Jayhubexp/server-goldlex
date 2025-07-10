import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	productName: {
		type: String,
		required: [true, "Product name is required"],
		trim: true,
	},
	quantity: {
		type: Number,
		required: [true, "Quantity is required"],
		min: [1, "Quantity must be at least 1"],
	},
	price: {
		type: Number,
		required: [true, "Price is required"],
		min: [0, "Price cannot be negative"],
	},
});

const orderSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		phoneNumber: {
			type: String,
			trim: true,
			match: [
				/^(0\d{9}|\+\d{10,15}|\d{10,15})$/,
				"Please enter a valid phone number",
			],
		},
		products: {
			type: [productSchema],
			required: [true, "At least one product is required"],
			validate: {
				validator: function (products) {
					return products && products.length > 0;
				},
				message: "At least one product is required",
			},
		},
		totalAmount: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "cancelled"],
			default: "pending",
		},
	},
	{
		timestamps: true,
	},
);

// Calculate total amount before saving
orderSchema.pre("save", function (next) {
	this.totalAmount = this.products.reduce((total, product) => {
		return total + product.quantity * product.price;
	}, 0);
	next();
});

export default mongoose.model("Order", orderSchema);
