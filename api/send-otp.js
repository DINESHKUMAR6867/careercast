// api/send-otp.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // For now, log to console (you can replace this with email sending later)
    console.log(`📧 OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otp,
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
