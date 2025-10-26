// api/send-otp.js
import fetch from "node-fetch";

export default async function handler(request, response) {
  // Log that the function is being called
  console.log('🔍 /api/send-otp called with method:', request.method);
  
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('🔍 OPTIONS preflight request handled');
    response.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    console.log('❌ Method not allowed:', request.method);
    response.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowed: ['POST'],
      received: request.method
    });
    return;
  }
  
  try {
    // Parse JSON body - using text() method which is more reliable
    const rawBody = await request.text();
    console.log('📥 Raw body length:', rawBody.length);
    
    let jsonData;
    if (rawBody) {
      jsonData = JSON.parse(rawBody);
    } else {
      jsonData = {};
    }
    
    console.log('📥 Parsed JSON data type:', typeof jsonData);
    console.log('📥 Parsed JSON keys:', jsonData ? Object.keys(jsonData) : 'null');
    
    // Handle case where jsonData might not be an object
    if (!jsonData || typeof jsonData !== 'object') {
      console.error('❌ JSON data is not an object:', jsonData);
      return response.status(400).json({ 
        error: 'Invalid request body format',
        received: jsonData,
        type: typeof jsonData
      });
    }
    
    const { email, otp } = jsonData;
    console.log('📥 Received email:', email);
    
    if (!email) {
      console.log('❌ Email is required');
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
    console.error('💥 Error in /api/send-otp:', error);
    response.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}