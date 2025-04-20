'use client';
import { useState } from 'react';
import axios from 'axios';

export default function AddWebsiteForm({ userId }: { userId: string }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post('/api/websites', { url, userId });
      setMessage({ text: 'Website added!', type: 'success' });
      setUrl('');
    } catch {
      setMessage({ text: 'Failed to add website', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {message && (
        <div className={`p-2 rounded ${message.type === 'error' ? 'bg-red-900/20 text-red-300' : 'bg-green-900/20 text-green-300'}`}>
          {message.text}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-100"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white disabled:opacity-50 transition-colors"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}