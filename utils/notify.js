import nodemailer from "nodemailer";

export async function sendEmail(to, subject, text, html = null, options = {}) {
	// We use the Gmail credentials from your .env
	const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

	if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
		console.warn("Email not sent: Gmail credentials missing.");
		return { skipped: true, reason: "Credentials missing" };
	}

	// Create the transporter using Gmail
	const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: GMAIL_USER,
		pass: GMAIL_APP_PASSWORD,
	},
	connectionTimeout: 10000,
	greetingTimeout: 10000,
	socketTimeout: 20000,
});

	const mailOptions = {
		from: `"Goldlex Auto" <${GMAIL_USER}>`, // Adds a nice name
		to,
		subject,
		text, // Plain text version
		...(html ? { html } : {}),
		...(options.replyTo ? { replyTo: options.replyTo } : {}),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(`✅ Email sent to ${to}:`, info.response);
		return { sent: info.accepted?.length > 0, response: info.response };
	} catch (error) {
		console.error(`❌ Error sending to ${to}:`, error);
		return { sent: false, error };
	}
}
