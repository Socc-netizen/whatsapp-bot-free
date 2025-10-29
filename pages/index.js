import { useState, useEffect } from 'react';
import axios from 'axios';

export default function WhatsAppPanelFree() {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const connectWhatsApp = async () => {
    try {
      setStatus('Generating QR Code...');
      const response = await axios.get('/api/whatsapp/connect');
      setQrCode(response.data.qr);
      setStatus('Scan QR Code dengan WhatsApp');
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await axios.get('/api/whatsapp/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const startPushKontak = async () => {
    if (!selectedGroup || !message) {
      alert('Pilih grup dan isi pesan terlebih dahulu!');
      return;
    }

    setIsSending(true);
    try {
      await axios.post('/api/whatsapp/pushkontak', {
        groupId: selectedGroup,
        message: message
      });
      alert('Push Kontak Berhasil Dimulai!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const saveContacts = async () => {
    if (!selectedGroup) {
      alert('Pilih grup terlebih dahulu!');
      return;
    }

    try {
      await axios.post('/api/whatsapp/save-contacts', {
        groupId: selectedGroup
      });
      alert('Kontak berhasil disimpan!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">WhatsApp Bot Panel FREE</h1>
          <p className="text-blue-200">Push Kontak & Auto Save - 100% Gratis</p>
        </header>

        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Status: {status}</h2>
              <p className="text-green-400">Server: Online</p>
            </div>
            <button 
              onClick={connectWhatsApp}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Connect WhatsApp
            </button>
          </div>
          
          {qrCode && (
            <div className="mt-4 text-center">
              <p className="mb-2">Scan QR Code ini dengan WhatsApp:</p>
              <img src={qrCode} alt="QR Code" className="mx-auto w-64 h-64 border-4 border-white rounded" />
            </div>
          )}
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Grup WhatsApp</h2>
          <div className="flex gap-4 mb-4">
            <button 
              onClick={loadGroups}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Load Groups
            </button>
            <button 
              onClick={saveContacts}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
            >
              Auto Save Contacts
            </button>
          </div>
          
          <select 
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded mb-4"
          >
            <option value="">Pilih Grup</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.participantsCount} members)
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Push Kontak Message</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan yang akan dikirim ke semua anggota grup..."
            className="w-full h-32 bg-gray-700 p-4 rounded mb-4 text-white"
          />
          <button 
            onClick={startPushKontak}
            disabled={isSending}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isSending ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSending ? 'Mengirim...' : 'Start Push Kontak'}
          </button>
          <p className="text-sm text-gray-300 mt-2">
            Pesan akan dikirim ke semua anggota grup satu per satu
          </p>
        </div>

        <footer className="text-center mt-8 text-gray-400">
          <p>Powered by Vercel + Railway - 100% Free Hosting</p>
        </footer>
      </div>
    </div>
  );
}
