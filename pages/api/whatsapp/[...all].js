export default async function handler(req, res) {
  // Backend URL langsung
  const BACKEND_URL = 'https://whatsapp-bot-backend-production.up.railway.app';
  const path = req.query.all?.join('/') || '';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/${path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.body ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Proxy error',
      message: error.message 
    });
  }
}
