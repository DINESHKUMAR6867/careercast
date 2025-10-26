// This would be in your backend (Node.js/Express, Python/FastAPI, etc.)
app.post('/api/generate-introduction', async (req, res) => {
  try {
    const { prompt, jobTitle, jobDescription, resumeText } = req.body;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4', // or 'gpt-3.5-turbo'
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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    
    if (data.choices && data.choices[0]) {
      res.json({
        success: true,
        introduction: data.choices[0].message.content
      });
    } else {
      throw new Error('No response from OpenAI');
    }
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate introduction'
    });
  }
});