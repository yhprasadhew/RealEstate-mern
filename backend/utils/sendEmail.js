const SendEmail = async (options) => {
    const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();

    if (!BREVO_API_KEY) {
        throw new Error(
            "Brevo API key is missing. Please set BREVO_API_KEY in your .env file."
        );
    }

    const data = {
        sender: {
            name: "Real Estate App",
            email: process.env.EMAIL_USER,
        },
        to: [
            {
                email: options.email,
            },
        ],
        subject: options.subject,
        htmlContent: options.message,
    };

    const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        console.error("Brevo Error:", error.message);
        throw new Error(result.message || "Failed to send email.");
    }

    console.log("Email sent successfully:", result);
    return result;
};

export default SendEmail;