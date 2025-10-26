export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method === 'GET') {
    return response.status(200).json({ 
      message: 'Test API is working',
      method: request.method,
      timestamp: new Date().toISOString()
    });
  }
  
  if (request.method === 'POST') {
    try {
      // Parse JSON body using the correct Vercel approach
      const data = await request.json();
      
      return response.status(200).json({ 
        message: 'Test POST successful',
        received: data,
        method: request.method,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return response.status(400).json({ 
        error: 'Invalid JSON',
        message: error.message
      });
    }
  }
  
  return response.status(405).json({ 
    error: 'Method not allowed',
    allowed: ['GET', 'POST'],
    received: request.method
  });
}