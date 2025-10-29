import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'https://your-app.up.railway.app';

export default async function handler(req, res) {
  const path = req.query.all?.join('/') || '';
  
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
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ 
      error: 'Backend service unavailable',
      message: error.message 
    });
  }
}
