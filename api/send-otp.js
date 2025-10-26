// api/send-otp.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  // --- Handle preflight ---
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Allow only POST ---
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowed: ["POST"],
      received: req.method,
    });
  }

  // --- Parse JSON body (fix for request.json is not a function) ---
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

  const { email, otp } = jsonData || {};
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // --- Generate OTP ---
  const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000);
  
  // Log OTP for development/testing
  console.log(`📧 OTP for ${email}: ${generatedOtp}`);

  // --- Success response ---
  return res.status(200).json({
    success: true,
    message: "OTP generated successfully",
    developmentOtp: generatedOtp
  });
}