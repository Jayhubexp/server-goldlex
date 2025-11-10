import nodemailer from "nodemailer";

/**
 * Send an email using Nodemailer + SendGrid SMTP.
 * Works cleanly on Render and local environments.
 */
export async function sendEmail(to, subject, text) {
	// Load required environment variables
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
		process.env;

	// Safety check: skip if not configured
	if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
		console.warn("Email not sent: SMTP environment variables are missing.");
		return { skipped: true, reason: "SMTP not configured" };
	}

	// --- FIXED TRANSPORTER CONFIG ---
	const transporterOptions = {
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: Number(SMTP_PORT) === 465, // ✅ false for 587 (STARTTLS)
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
		connectionTimeout: 10000, // ms
		greetingTimeout: 10000,
		socketTimeout: 20000,

		tls: {
			rejectUnauthorized: false,
		},

		logger: false,
		debug: false,
	};

	try {
		const transporter = nodemailer.createTransport(transporterOptions);

		// Verify the connection (quickly detects bad network/firewall)
		try {
			await transporter.verify();
			console.log("SMTP connection verified successfully.");
		} catch (verifyErr) {
			console.error("SMTP verify failed:", {
				code: verifyErr.code,
				message: verifyErr.message,
			});
			return { skipped: false, error: verifyErr };
		}

		// Send the message
		const info = await transporter.sendMail({
			from: EMAIL_FROM,
			to,
			subject,
			text,
		});

		console.log("✅ Email sent successfully:", info.messageId);
		return { skipped: false, info };
	} catch (err) {
		console.error("❌ Error sending email:", err.code, err.message);
		return { skipped: false, error: err };
	}
}
