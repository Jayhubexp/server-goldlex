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

	try {
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

		console.log("Email sent successfully:", info.messageId);
		return { skipped: false, info };
	} catch (err) {
		console.error("Error sending email:", err);
		return { skipped: false, error: err.message || String(err) };
	}
}
