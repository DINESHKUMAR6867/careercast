// api/send-otp.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowed: ["POST"],
      received: req.method,
    });
  }

  // Parse JSON body
  let jsonData;
  try {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const rawBody = Buffer.concat(buffers).toString();
    jsonData = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({
      error: "Invalid JSON in request body",
      details: err.message,
    });
  }

  const { email } = jsonData;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`📧 Sending OTP ${otp} to ${email}`);

  try {
    // 🔐 Get Microsoft Graph access token
    const tenantId = process.env.VITE_TENANT_ID;
    const clientId = process.env.VITE_CLIENT_ID;
    const clientSecret = process.env.VITE_CLIENT_SECRET;
    const senderEmail = process.env.VITE_SENDER_EMAIL;

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
    if (!tokenData.access_token) {
      console.error("Failed to get access token", tokenData);
      return res.status(500).json({ error: "Failed to authenticate with Microsoft Graph" });
    }

    const accessToken = tokenData.access_token;

    // 📩 Send email through Microsoft Graph API
    const messageBody = {
      message: {
        subject: "Your One-Time Password (OTP) – CareerCast",
        body: {
          contentType: "HTML",
          content: `
            <div style="font-family: Arial; line-height: 1.5;">
              <h2 style="color: #0078d4;">CareerCast OTP Verification</h2>
              <p>Hi,</p>
              <p>Your OTP for verification is:</p>
              <h1 style="letter-spacing: 2px;">${otp}</h1>
              <p>This OTP is valid for 10 minutes.</p>
              <p>Best regards,<br/>CareerCast Team</p>
            </div>
          `,
        },
        toRecipients: [{ emailAddress: { address: email } }],
      },
      saveToSentItems: "false",
    };

    const mailRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      }
    );

    if (!mailRes.ok) {
      const errText = await mailRes.text();
      throw new Error(`Email send failed: ${errText}`);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully via Microsoft Graph.",
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return res.status(500).json({
      error: "Failed to send OTP email",
      details: error.message,
    });
  }
}
