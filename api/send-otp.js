// api/send-otp.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const tenantId = process.env.VITE_TENANT_ID;
    const clientId = process.env.VITE_CLIENT_ID;
    const clientSecret = process.env.VITE_CLIENT_SECRET;
    const senderEmail = process.env.VITE_SENDER_EMAIL;

    if (!tenantId || !clientId || !clientSecret || !senderEmail) {
      console.error("Missing Microsoft credentials in .env");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Get Microsoft Graph access token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Token error:", tokenData);
      return res.status(500).json({ error: "Failed to get access token" });
    }

    const accessToken = tokenData.access_token;

    // Send OTP email
    const mailBody = {
      message: {
        subject: "Your ApplyWizz OTP Code",
        body: {
          contentType: "HTML",
          content: `
            <h2>Your ApplyWizz OTP</h2>
            <p>Your one-time code is:</p>
            <h1>${otp}</h1>
            <p>This code expires in 5 minutes.</p>
          `,
        },
        toRecipients: [{ emailAddress: { address: email } }],
        from: { emailAddress: { address: senderEmail } },
      },
      saveToSentItems: false,
    };

    const sendRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mailBody),
      }
    );

    if (!sendRes.ok) {
      const sendErr = await sendRes.text();
      console.error("SendMail error:", sendErr);
      return res.status(500).json({ error: "Failed to send email" });
    }

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ success: true, otp });
  } catch (err) {
    console.error("Error in /api/send-otp:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
