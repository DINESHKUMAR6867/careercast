// api/send-otp.js
import fetch from "node-fetch";

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    return;
  }
  
  try {
    const { email, otp } = await request.json();
    
    if (!email) {
      response.status(400).json({
        success: false,
        error: 'Email is required'
      });
      return;
    }
    
    // Generate OTP if not provided
    const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000);
    
    // Log OTP for development/testing
    console.log(`📧 OTP for ${email}: ${generatedOtp}`);
    
    // Success response
    response.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      developmentOtp: generatedOtp
    });
  } catch (error) {
    console.error('Error in /api/send-otp:', error);
    response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
