export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API key in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
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
    
    if (!openaiResponse.ok) {
      console.error('OpenAI API Error:', data);
      return res.status(500).json({ error: 'Failed to generate introduction' });
    }

    if (data.choices && data.choices[0]) {
      return res.status(200).json({
        success: true,
        introduction: data.choices[0].message.content
      });
    } else {
      throw new Error('No response from OpenAI');
    }
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate introduction'
    });
  }
}