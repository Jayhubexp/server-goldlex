import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
	const { type, amount, income, durationMonths } = req.body;
	// Simple Heuristic Logic
	// Individual: Monthly repayment (Amount / Duration) should not exceed 40% of Monthly Income
	// Business: Loan Amount should not exceed 30% of Annual Revenue (Income * 12 if monthly provided, or just Income if annual)

	let qualified = false;
	let maxAmount = 0;
	let reason = "";

	const numericAmount = Number(amount);
	const numericIncome = Number(income);
	const months = Number(durationMonths) || 12;

	if (type === "individual") {
		const monthlyRepayment = numericAmount / months;
		const limit = numericIncome * 0.4; // 40% debt-to-income

		if (monthlyRepayment <= limit) {
			qualified = true;
		} else {
			reason = "Monthly repayment exceeds 40% of monthly income.";
		}
		maxAmount = limit * months;
	} else if (type === "business") {
		// Assuming input 'income' for business is Monthly Revenue for simplicity
		const annualRevenue = numericIncome * 12;
		const limit = annualRevenue * 0.3; // 30% of annual revenue

		if (numericAmount <= limit) {
			qualified = true;
		} else {
			reason = "Loan amount exceeds 30% of estimated annual revenue.";
		}
		maxAmount = limit;
	}

	res.json({
		success: true,
		qualified,
		maxAmount: Math.floor(maxAmount),
		reason,
	});
});

export default router;
