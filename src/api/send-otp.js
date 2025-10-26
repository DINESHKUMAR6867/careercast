export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // you can integrate here with your email sender (e.g., SendGrid, MS Graph)
    console.log(`📧 OTP for ${email}: ${otp}`);

    return res.status(200).json({ success: true, otp });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
