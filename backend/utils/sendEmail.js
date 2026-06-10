const SendEmail = async (options) => {
    const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
    const EMAIL_USER = process.env.EMAIL_USER?.trim();

    if (!BREVO_API_KEY) {
        throw new Error(
            "Brevo API key is missing. Set BREVO_API_KEY in backend/.env"
        );
    }

    if (!EMAIL_USER) {
        throw new Error(
            "Sender email is missing. Set EMAIL_USER in backend/.env"
        );
    }

    const data = {
        sender: {
            name: "Real Estate App",
            email: EMAIL_USER,
        },
        to: [
            {
                email: options.email,
            },
        ],
        subject: options.subject,
        htmlContent: options.message,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("Brevo API error:", result);

        if (result.code === "unauthorized" && result.message?.includes("IP address")) {
            throw new Error(
                "Brevo blocked this server IP. Add it under Brevo → Security → Authorized IPs, or disable IP restriction."
            );
        }

        throw new Error(result.message || "Failed to send email via Brevo.");
    }

    console.log("Email sent successfully. messageId:", result.messageId);
    return result;
};

export default SendEmail;
