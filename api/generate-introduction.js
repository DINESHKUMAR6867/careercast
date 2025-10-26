export default async function handler(request, response) {
  // Log that the function is being called
  console.log('🔍 /api/generate-introduction called with method:', request.method);
  
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('🔍 OPTIONS preflight request handled');
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'POST') {
    console.log('❌ Method not allowed:', request.method);
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use request.json() for Vercel serverless functions instead of req.body
    const { prompt } = await request.json();
    console.log('📥 Received prompt, length:', prompt ? prompt.length : 0);

    if (!prompt) {
      console.log('❌ Prompt is required');
      return response.status(400).json({ error: 'Prompt is required' });
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ Missing OpenAI API key in environment variables');
      return response.status(500).json({ error: 'Server configuration error' });
    }

    console.log('🔑 OpenAI API key found, calling OpenAI API');
    
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
            content: 'You are a professional career coach specializing in creating compelling self-introductions for job applicants.'
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
    console.log('📤 OpenAI API response status:', openaiResponse.status);
    
    if (!openaiResponse.ok) {
      console.error('❌ OpenAI API Error:', data);
      return response.status(500).json({ error: 'Failed to generate introduction' });
    }

    if (data.choices && data.choices[0]) {
      console.log('✅ Successfully generated introduction');
      return response.status(200).json({
        success: true,
        introduction: data.choices[0].message.content
      });
    } else {
      console.error('❌ No response from OpenAI');
      throw new Error('No response from OpenAI');
    }
    
  } catch (error) {
    console.error('💥 OpenAI API Error:', error);
    return response.status(500).json({
      success: false,
      error: 'Failed to generate introduction'
    });
  }
}