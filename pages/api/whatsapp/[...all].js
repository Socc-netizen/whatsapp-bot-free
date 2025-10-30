import axios from 'axios';

export default async function handler(req, res) {
  // Backend URL - langsung hardcode untuk testing
  const BACKEND_URL = 'https://whatsapp-bot-backend-production.up.railway.app';
  
  // Extract path dari query parameters
  const path = req.query.all ? req.query.all.join('/') : '';
  
  try {
    const response = await axios({
      method: req.method,
      url: `${BACKEND_URL}/api/${path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Bot-Panel/1.0'
      },
      timeout: 15000
    });
    
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Backend offline',
        message: 'WhatsApp backend server is not responding'
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(502).json({ 
        error: 'Network error',
        message: 'Cannot connect to backend server'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal proxy error',
        message: error.message 
      });
    }
  }
}
