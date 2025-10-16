import express from "express";
import { body, validationResult } from "express-validator";
import CarForm from "../models/CarForm.js";
import nodemailer from "nodemailer";
import Twilio from "twilio";

const router = express.Router();

// Validation middleware
const validateCarForm = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ max: 100 })
		.withMessage("Name cannot exceed 100 characters"),
	body("phoneNumber")
		.trim()
		.notEmpty()
		.withMessage("Phone number is required")
		.matches(/^(0\d{9}|\+\d{15}|\d{10})$/)
		.withMessage("Please enter a valid phone number"),
	body("email")
		.optional()
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("message")
		.trim()
		.notEmpty()
		.withMessage("Message is required")
		.isLength({ max: 1000 })
		.withMessage("Message cannot exceed 1000 characters"),
];

// Helper: send email if transporter configured
async function sendEmail(to, subject, text) {
	// Expect SMTP config in env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
		process.env;
	if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
		// Not configured — skip silently
		return { skipped: true, reason: "SMTP not configured" };
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
	});

	const info = await transporter.sendMail({
		from: EMAIL_FROM,
		to,
		subject,
		text,
	});

	return { skipped: false, info };
}

// Helper: send SMS via Twilio if configured
async function sendSms(to, bodyText) {
	const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM } = process.env;
	if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
		return { skipped: true, reason: "Twilio not configured" };
	}

	const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
	const msg = await client.messages.create({
		from: TWILIO_FROM,
		to: ADMIN_PHONE_NUMBER,
		body: bodyText,
	});
	return { skipped: false, msg };
}

// POST /api/car-form
router.post("/", validateCarForm, async (req, res, next) => {
	try {
		// Check validation results
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { name, phoneNumber, email, message, sendEmailTo, sendSmsTo } =
			req.body;

		const carForm = new CarForm({
			name,
			phoneNumber,
			email,
			message,
		});

		await carForm.save();

		// Prepare notification text
		const subject = `New car inquiry from ${name}`;
		const text = `You have a new car inquiry:\n\nName: ${name}\nPhone: ${phoneNumber}\nEmail: ${
			email || "(not provided)"
		}\n\nMessage:\n${message}`;

		// Send email if recipient provided or configured default
		let emailResult = { skipped: true };
		const emailRecipient = sendEmailTo || process.env.NOTIFY_EMAIL;
		if (emailRecipient) {
			try {
				emailResult = await sendEmail(emailRecipient, subject, text);
			} catch (err) {
				// attach error but don't fail overall request
				emailResult = { skipped: false, error: err.message || String(err) };
			}
		}

		// Send SMS if recipient provided or configured default
		let smsResult = { skipped: true };
		const smsRecipient = sendSmsTo || process.env.NOTIFY_PHONE;
		if (smsRecipient) {
			try {
				smsResult = await sendSms(smsRecipient, `${subject} - ${message}`);
			} catch (err) {
				smsResult = { skipped: false, error: err.message || String(err) };
			}
		}

		res.status(201).json({
			success: true,
			message: "Car form submitted successfully",
			data: {
				id: carForm._id,
				name: carForm.name,
				phoneNumber: carForm.phoneNumber,
				email: carForm.email,
				submittedAt: carForm.createdAt,
			},
			notifications: {
				email: emailResult,
				sms: smsResult,
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
