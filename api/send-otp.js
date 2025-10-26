// api/send-otp.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed" 
    });
  }

  try {
    const { email, otp } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: "Email is required" 
      });
    }

    // If OTP wasn't provided, generate one
    const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000);

    const tenantId = process.env.VITE_TENANT_ID;
    const clientId = process.env.VITE_CLIENT_ID;
    const clientSecret = process.env.VITE_CLIENT_SECRET;
    const senderEmail = process.env.VITE_SENDER_EMAIL;

    if (!tenantId || !clientId || !clientSecret || !senderEmail) {
      console.error("Missing Microsoft credentials in environment variables");
      // Fallback to development mode - log OTP
      console.log(`📧 OTP for ${email}: ${generatedOtp}`);
      return res.status(200).json({ 
        success: true, 
        message: "OTP generated successfully (dev mode)",
        developmentOtp: generatedOtp 
      });
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
      // Fallback to development mode
      console.log(`📧 OTP for ${email}: ${generatedOtp}`);
      return res.status(200).json({ 
        success: true, 
        message: "OTP generated successfully (dev mode)",
        developmentOtp: generatedOtp 
      });
    }

    const accessToken = tokenData.access_token;

    // Send OTP email
    const mailBody = {
      message: {
        subject: "CareerCast - Verify Your Email",
        body: {
          contentType: "HTML",
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; text-align: center;">CareerCast Email Verification</h2>
              <p>Hello,</p>
              <p>Thank you for signing up for CareerCast! Use the following OTP code to verify your email address:</p>
              <div style="text-align: center; font-size: 32px; font-weight: bold; color: #2563eb; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
                ${generatedOtp}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this verification, please ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
                <p>Best regards,<br>The CareerCast Team</p>
              </div>
            </div>
          `,
        },
        toRecipients: [{ emailAddress: { address: email } }],
        from: { emailAddress: { address: senderEmail } },
      },
      saveToSentItems: true,
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
      // Fallback to development mode
      console.log(`📧 OTP for ${email}: ${generatedOtp}`);
      return res.status(200).json({ 
        success: true, 
        message: "OTP generated successfully (dev mode)",
        developmentOtp: generatedOtp 
      });
    }

    console.log(`✅ OTP sent to ${email}: ${generatedOtp}`);
    return res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully to your email"
    });
  } catch (err) {
    console.error("Error in /api/send-otp:", err);
    // Even in case of error, provide OTP for development
    const fallbackOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(`📧 Fallback OTP for ${req.body?.email || 'unknown'}: ${fallbackOtp}`);
    return res.status(200).json({ 
      success: true, 
      message: "OTP generated successfully (fallback dev mode)",
      developmentOtp: fallbackOtp 
    });
  }
}