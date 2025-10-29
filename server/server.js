const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsappbot';
let db;

async function connectDB() {
  try {
    const mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('Using in-memory storage');
  }
}

let client = null;
let qrCode = null;
let isConnected = false;

function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "whatsapp-bot-free"
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    }
  });

  client.on('qr', async (qr) => {
    console.log('QR Received');
    qrCode = await qrcode.toDataURL(qr);
  });

  client.on('ready', () => {
    console.log('WhatsApp Client Ready!');
    isConnected = true;
    qrCode = null;
  });

  client.on('disconnected', () => {
    console.log('WhatsApp Disconnected');
    isConnected = false;
    setTimeout(() => {
      client.initialize();
    }, 5000);
  });

  client.initialize();
}

app.get('/api/status', (req, res) => {
  res.json({ 
    status: isConnected ? 'connected' : 'disconnected',
    qr: qrCode 
  });
});

app.get('/api/connect', async (req, res) => {
  if (!isConnected && qrCode) {
    res.json({ qr: qrCode, status: 'scan_qr' });
  } else if (isConnected) {
    res.json({ status: 'connected' });
  } else {
    if (client) {
      client.destroy();
    }
    initWhatsApp();
    res.json({ status: 'generating_qr' });
  }
});

app.get('/api/groups', async (req, res) => {
  if (!isConnected || !client) {
    return res.json({ groups: [] });
  }

  try {
    const chats = await client.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(group => ({
        id: group.id._serialized,
        name: group.name,
        participantsCount: group.participants.length
      }));
    
    res.json({ groups });
  } catch (error) {
    res.json({ groups: [], error: error.message });
  }
});

app.post('/api/pushkontak', async (req, res) => {
  const { groupId, message } = req.body;

  if (!isConnected || !client) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  if (!groupId || !message) {
    return res.status(400).json({ error: 'Group ID and message required' });
  }

  try {
    const group = await client.getChatById(groupId);
    const participants = group.participants;
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      try {
        await client.sendMessage(participant.id._serialized, message);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      } catch (error) {
        console.error(`Failed to send to ${participant.id.user}:`, error);
        failCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Push kontak selesai! Berhasil: ${successCount}, Gagal: ${failCount}` 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-contacts', async (req, res) => {
  const { groupId } = req.body;

  if (!isConnected || !client) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  try {
    const group = await client.getChatById(groupId);
    const participants = group.participants;

    const contacts = participants.map(p => ({
      number: p.id.user,
      name: p.name || p.pushname || 'Unknown',
      group: group.name,
      savedAt: new Date()
    }));

    if (db) {
      await db.collection('contacts').insertMany(contacts);
    }

    res.json({ 
      success: true, 
      saved: contacts.length,
      contacts: contacts 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectDB().then(() => {
  initWhatsApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WhatsApp Bot Server running on port ${PORT}`);
  });
});
