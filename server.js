import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";

// Import routes
import contactRoutes from "./routes/contact.js";
import orderRoutes from "./routes/order.js";
import creditApplicationRoutes from "./routes/creditApplication.js";
import carFormRoutes from "./routes/carForm.js";
import carRoutes from "./routes/car.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration

app.use(
	cors({
		origin: "https://goldlex-auto.vercel.app", // <--- EXPLICITLY SET YOUR VERCEL FRONTEND URL HERE
		credentials: true,
	}),
);
// app.use(
// 	cors({
// 		origin:
// 			process.env.NODE_ENV === "production"
// 				? ["https://goldlex-auto.vercel.app/"] // Replace with your frontend domain
// 				: ["http://localhost:3000", "http://localhost:5173"], // Development origins
// 		credentials: true,
// 	}),
// );

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// API routes
app.use("/api/contact", contactRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/credit-application", creditApplicationRoutes);
app.use("/api/car-form", carFormRoutes);
app.use("/api/cars", carRoutes);

// Handle 404 for undefined routes
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
