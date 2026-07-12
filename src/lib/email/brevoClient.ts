type SendSmtpEmailPayload = {
  to: Array<{ email: string; name?: string }>;
  sender: { email: string; name?: string };
  subject: string;
  htmlContent: string;
};

export async function sendTransactionalEmail(payload: SendSmtpEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export default sendTransactionalEmail;
