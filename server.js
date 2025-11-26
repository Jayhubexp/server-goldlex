import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";

import contactRoutes from "./routes/contact.js";
import orderRoutes from "./routes/order.js";
import creditApplicationRoutes from "./routes/creditApplication.js";
import individualCreditApplicationRoutes from "./routes/individualCreditApplication.js"; // New
import carFormRoutes from "./routes/carForm.js";
import carRoutes from "./routes/car.js";
import investorRoutes from "./routes/investor.js";
import eligibilityRoutes from "./routes/eligibility.js"; // New

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
app.use(helmet());
app.use(
	cors({
		origin: [
			"https://goldlex-auto.vercel.app",
			"https://goldgroupservice.com",
			"http://localhost:5173",
			"http://localhost:3000",
		],
		credentials: true,
	}),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

app.get("/health", (req, res) =>
	res.json({ success: true, message: "Server is running" }),
);

app.use("/api/contact", contactRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/credit-application", creditApplicationRoutes); // Business
app.use(
	"/api/individual-credit-application",
	individualCreditApplicationRoutes,
); // Individual
app.use("/api/car-form", carFormRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/check-eligibility", eligibilityRoutes); // Qualification check

app.use("*", (req, res) =>
	res.status(404).json({ success: false, message: "Route not found" }),
);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
