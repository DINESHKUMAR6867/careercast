export default async function handler(request, response) {
  try {
    // Always set CORS headers first
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }
    
    // Only accept POST requests
    if (request.method !== 'POST') {
      return response.status(405).json({ 
        error: 'Method not allowed',
        allowed: ['POST'],
        received: request.method
      });
    }

    // Parse JSON body - using text() method which is more reliable
    let jsonData;
    try {
      const rawBody = await request.text();
      if (rawBody) {
        jsonData = JSON.parse(rawBody);
      } else {
        jsonData = {};
      }
    } catch (parseError) {
      return response.status(400).json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message
      });
    }
    
    const { prompt } = jsonData;

    if (!prompt) {
      return response.status(400).json({ 
        error: 'Prompt is required'
      });
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Return a mock response for testing/development
      return response.status(200).json({
        success: true,
        introduction: "This is a mock introduction. Please set VITE_OPENAI_API_KEY in Vercel."
      });
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional career coach.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 350,
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    
    if (!openaiResponse.ok) {
      return response.status(500).json({ 
        error: 'Failed to generate introduction',
        openaiError: data.error ? data.error.message : 'Unknown OpenAI error'
      });
    }

    if (data.choices && data.choices[0]) {
      return response.status(200).json({
        success: true,
        introduction: data.choices[0].message.content
      });
    } else {
      return response.status(500).json({ 
        error: 'No response from OpenAI'
      });
    }
  } catch (error) {
    // Make sure we always return a response
    if (!response.headersSent) {
      return response.status(500).json({
        success: false,
        error: 'Failed to generate introduction',
        details: error.message
      });
    }
  }
}