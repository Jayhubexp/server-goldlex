import nodemailer from "nodemailer";

// Helper: send email if transporter configured
export async function sendEmail(to, subject, text) {
	// Expect SMTP config in env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
		process.env;
	if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
		console.warn(
			"Email not sent: SMTP environment variables are not configured.",
		);
		return { skipped: true, reason: "SMTP not configured" };
	}

	// Build transporter options with sensible timeouts and TLS options to surface network issues quickly
	const transporterOptions = {
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: Number(SMTP_PORT) === 465, // true for 465 (SMTPS), false for STARTTLS (587)
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
		// Timeouts (ms) — tune as needed; these help fail fast on connection problems
		connectionTimeout: 10000, // socket connection timeout
		greetingTimeout: 10000, // SMTP greeting timeout
		socketTimeout: 20000,
		// If your SMTP provider uses a self-signed cert or Render environment causes TLS issues,
		// you can relax validation. Prefer not to set this in production unless necessary.
		tls: {
			rejectUnauthorized: true,
		},
		// Enable debugging/verbose logs in deployed app logs when troubleshooting
		logger: false,
		debug: false,
	};

	try {
		const transporter = nodemailer.createTransport(transporterOptions);

		// Verify connection configuration — this will attempt to connect and fail fast if unreachable
		try {
			await transporter.verify();
		} catch (verifyErr) {
			console.error("SMTP verify failed:", {
				code: verifyErr && verifyErr.code,
				message: verifyErr && verifyErr.message,
			});
			// Return detailed error so caller/logs can show the underlying cause
			return { skipped: false, error: verifyErr };
		}

		const info = await transporter.sendMail({
			from: EMAIL_FROM,
			to,
			subject,
			text,
		});

		console.log("Email sent successfully:", info.messageId);
		return { skipped: false, info };
	} catch (err) {
		// Log full error object to make debugging easier in Render logs
		console.error("Error sending email:", err && err.code, err && err.message);
		return { skipped: false, error: err };
	}
}
