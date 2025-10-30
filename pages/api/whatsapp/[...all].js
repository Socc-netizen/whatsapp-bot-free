import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'https://whatsapp-bot-backend-production.up.railway.app';

export default async function handler(req, res) {
  const path = req.query.all?.join('/') || '';
  
  console.log(`Proxying request to: ${BACKEND_URL}/api/${path}`);
  
  try {
    const response = await axios({
      method: req.method,
      url: `${BACKEND_URL}/api/${path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('Proxy success:', response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      // Backend responded with error
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // No response from backend
      res.status(503).json({ 
        error: 'Backend service unavailable',
        message: 'Cannot connect to WhatsApp backend server'
      });
    } else {
      // Other error
      res.status(500).json({ 
        error: 'Proxy error',
        message: error.message 
      });
    }
  }
}
