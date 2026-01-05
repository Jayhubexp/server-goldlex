import sgMail from "@sendgrid/mail";


export async function sendEmail(to, subject, text) {
	const { SENDGRID_API_KEY, EMAIL_FROM } = process.env;

	if (!SENDGRID_API_KEY || !EMAIL_FROM) {
		console.warn("Email not sent: SENDGRID_API_KEY or EMAIL_FROM missing.");
		return { skipped: true, reason: "API key not configured" };
	}

	sgMail.setApiKey(SENDGRID_API_KEY);

	const msg = {
		to,
		from: EMAIL_FROM, // must be a verified sender in SendGrid
		subject,
		text,
	};

	try {
		const response = await sgMail.send(msg);
		console.log("✅ Email sent successfully:", response[0].statusCode);
		return { sent: true, response: response[0].statusCode };
	} catch (error) {
		console.error("❌ Error sending email via SendGrid API:", error.message);
		if (error.response) {
			console.error("SendGrid API response:", error.response.body);
		}
		return { sent: false, error };
	}
}


export async function sendTemplateEmail(to, templateId, dynamicData) {
	const { SENDGRID_API_KEY, EMAIL_FROM } = process.env;

	if (!SENDGRID_API_KEY || !EMAIL_FROM) {
		console.warn("Template email not sent: keys missing.");
		return;
	}

	sgMail.setApiKey(SENDGRID_API_KEY);

	const msg = {
		to, // The user's email
		from: EMAIL_FROM, // Your verified sender
		templateId: templateId, // The ID you provided
		dynamic_template_data: dynamicData, // Data to fill {{variables}}
	};

	try {
		const response = await sgMail.send(msg);
		console.log("✅ User Acknowledgement sent:", response[0].statusCode);
		return { sent: true };
	} catch (error) {
		console.error("❌ Error sending user ack:", error.message);
		if (error.response) {
			console.error(error.response.body);
		}
		return { sent: false, error };
	}
}