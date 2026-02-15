import express from "express";
import crypto from "crypto"; // Native Node.js module for random passwords
import Investor from "../models/Investor.js";
import { sendEmail } from "../utils/notify.js";

const router = express.Router();


router.post("/", async (req, res, next) => {
    try {
        // A. Check for duplicates
        const existing = await Investor.findOne({ email: req.body.email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // B. Save new investor
        const investor = new Investor(req.body);
        await investor.save();

        
        try {
            // --- Email A: Notify Admin ---
            const adminEmail = process.env.NOTIFY_EMAIL;
            if (adminEmail) {
                await sendEmail(
                    adminEmail,
                    `New Investor Signup - ${investor.name || investor.fullName}`, // Subject
                    `Name: ${investor.name || investor.fullName}\nEmail: ${investor.email}\nAmount: ${investor.investmentAmount}` // Body
                );
            }

            // --- Email B: Acknowledge User ---
            // "Your signup was received... await verification"
            if (investor.email) {
                await sendEmail(
                    investor.email, 
                    "Welcome to Goldlex Auto Investment", // Subject
                    `Dear ${investor.name || investor.fullName},\n\nThank you for signing up as an investor. We have received your details and will review your application shortly.\n\nPlease await further communication regarding your verification status.\n\nBest Regards,\nGoldlex Team` // Body
                );
            }
        } catch (e) {
            console.error("Email sending failed:", e);
        }

        res.status(201).json({ success: true, message: "Investor registered successfully", data: investor });
    } catch (error) {
        next(error);
    }
});

// 2. PUBLIC: Login (New Route for Investor Dashboard)
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // 1. Log what the user sent
        console.log("Login Attempt:", email); 

        const investor = await Investor.findOne({ email }).select('+password');

        if (!investor) {
            console.log("❌ User not found in DB");
            return res.status(401).json({ success: false, message: "Invalid credentials (User)" });
        }

        // 2. Log what is in the DB (TEMPORARY - DELETE AFTER FIXING)
        
        // 3. Compare
        if (investor.password !== password) {
            console.log("❌ Password Mismatch");
            return res.status(401).json({ success: false, message: "Invalid credentials (Pass)" });
        }

        if (!investor.isVerified) {
            console.log("❌ Not Verified");
            return res.status(403).json({ success: false, message: "Account pending Admin approval." });
        }

        console.log("✅ Login Success!");
        res.json({ success: true, data: investor });
    } catch (error) {
        next(error);
    }
});

// 3. ADMIN: Get All Investors
router.get("/", async (req, res, next) => {
    try {
        const investors = await Investor.find().sort({ createdAt: -1 });
        res.json({ success: true, data: investors });
    } catch (e) {
        next(e);
    }
});

// 4. ADMIN: Get Single Investor (For Dashboard Refresh)
router.get("/:id", async (req, res, next) => {
    try {
        const investor = await Investor.findById(req.params.id);
        if (!investor) return res.status(404).json({ success: false, message: "Investor not found" });
        res.json({ success: true, data: investor });
    } catch (e) {
        next(e);
    }
});

// 5. ADMIN: Verify Investor & Generate Password (The Key Update)
router.patch("/:id/verify", async (req, res, next) => {
    try {
        // Generate a random 8-character password
        const generatedPassword = crypto.randomBytes(4).toString('hex');

        const investor = await Investor.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: true,
                status: 'active',
                password: generatedPassword
            },
            { new: true }
        );

        if (!investor) return res.status(404).json({ message: "Investor not found" });

        // Send the Password via Email
        try {
            await sendEmail(
                investor.email,
                "Account Verified - Login Details",
                `Dear ${investor.name || investor.fullName},\n\nYour investment account has been verified by our team.\n\nYou can now log in to your dashboard using the details below:\n\nEmail: ${investor.email}\nPassword: ${generatedPassword}\n\nPlease keep this password safe.\n\nBest Regards,\nGoldlex Auto Team`
            );
        } catch (e) {
            console.error("Failed to send verification email:", e);
        }

        res.json({ success: true, data: investor });
    } catch (e) { next(e); }
});

// 6. ADMIN: Add Transaction (Manage Funds)
router.post("/:id/transaction", async (req, res, next) => {
    try {
        const { type, amount, description } = req.body;
        const investor = await Investor.findById(req.params.id);

        if (!investor) return res.status(404).json({ message: "Investor not found" });

        let newBalance = investor.currentBalance;
        const numericAmount = parseFloat(amount);

        if (['DEPOSIT', 'RETURN', 'PROFIT'].includes(type)) {
            newBalance += numericAmount;
        } else if (['WITHDRAWAL', 'INVESTMENT', 'FEE'].includes(type)) {
            newBalance -= numericAmount;
        }

        investor.transactions.push({
            type,
            amount: numericAmount,
            description,
            balanceAfter: newBalance,
            date: new Date()
        });

        // Update Totals
        investor.currentBalance = newBalance;
        if (type === 'DEPOSIT') investor.totalInvested += numericAmount;
        if (type === 'RETURN') investor.totalReturns += numericAmount;

        await investor.save();
        res.json({ success: true, data: investor });
    } catch (e) { next(e); }
});

// 7. HANDLE WITHDRAWAL REQUEST
router.post("/withdraw", async (req, res, next) => {
    try {
        const { investorId, amount, name } = req.body;

        // Notify Admin
        const adminEmail = process.env.NOTIFY_EMAIL;
        if (adminEmail) {
            await sendEmail(
                adminEmail,
                `Action Required: Withdrawal Request`,
                `Investor ${name} has requested a withdrawal of GHS ${amount}.\n\nLog in to the Admin Dashboard to review their balance and process this payment manually.`
            );
        }

        res.json({ success: true, message: "Request sent" });
    } catch (error) {
        next(error);
    }
});

export default router;


// import express from "express";
// import Investor from "../models/Investor.js";
// import { sendEmail } from "../utils/notify.js";

// const router = express.Router();

// router.post("/", async (req, res, next) => {
// 	try {
// 		// 1. Check for duplicates
// 		const existing = await Investor.findOne({ email: req.body.email });
// 		if (existing) {
// 			return res.status(400).json({ success: false, message: "Email already registered" });
// 		}

// 		// 2. Save new investor
// 		const investor = new Investor(req.body);
// 		await investor.save();

// 		// 3. SEND EMAILS (The Fix)
// 		try {
// 			// --- Email A: Notify Admin (YOU) ---
// 			const adminEmail = process.env.NOTIFY_EMAIL;
// 			if (adminEmail) {
// 				await sendEmail(
// 					adminEmail,
// 					`New Investor Signup - ${investor.name}`, // Subject
// 					`Name: ${investor.name}\\nEmail: ${investor.email}\nAmount: ${investor.investmentAmount}` // Body
// 				);
// 			}

// 			// --- Email B: Acknowledge User (THEM) ---
// 			// This sends to the email address they typed in the form
// 			if (investor.email) {
// 				await sendEmail(
// 					investor.email, // <--- This is the fix. Sending to THEIR email.
// 					"Welcome to Goldlex Auto Investment", // Subject
// 					`Dear ${investor.name},\n\nThank you for signing up as an investor. We have received your details and will review your application shortly.\n\nBest Regards,\nGoldlex Team` // Body
// 				);
// 			}
// 		} catch (e) {
// 			console.error("Email sending failed:", e);
// 			// We don't stop the response if email fails, just log it
// 		}

// 		res.status(201).json({ success: true, message: "Investor registered successfully", data: investor });
// 	} catch (error) {
// 		next(error);
// 	}
// });

// router.get("/", async (req, res, next) => {
// 	try {
// 		const investors = await Investor.find().sort({ createdAt: -1 });
// 		res.json({ success: true, data: investors });
// 	} catch (e) {
// 		next(e);
// 	}
// });

// router.get("/:id", async (req, res, next) => {
//     try {
//         const investor = await Investor.findById(req.params.id);
//         if (!investor) return res.status(404).json({ success: false, message: "Investor not found" });
//         res.json({ success: true, data: investor });
//     } catch (e) {
//         next(e);
//     }
// });

// // 7. HANDLE WITHDRAWAL REQUEST
// router.post("/withdraw", async (req, res, next) => {
//     try {
//         const { investorId, amount, name } = req.body;
        
//         // Notify Admin
//         const adminEmail = process.env.NOTIFY_EMAIL;
//         if (adminEmail) {
//             await sendEmail(
//                 adminEmail,
//                 `Action Required: Withdrawal Request`,
//                 `Investor ${name} has requested a withdrawal of GHS ${amount}.\n\nLog in to the Admin Dashboard to review their balance and process this payment manually.`
//             );
//         }

//         res.json({ success: true, message: "Request sent" });
//     } catch (error) {
//         next(error);
//     }
// });

// export default router;

