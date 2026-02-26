import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createAlbum } from '../api/albums';

export default function CreateAlbumPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    try {
      const res = await createAlbum(form);
      navigate(`/albums/${res.data.id}`);
    } catch (err) {
      if (err.response?.status === 401) setError('401 – Please log in.');
      else if (err.response?.status === 400) setError('400 – Invalid input.');
      else setError('Failed to create album.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Link to="/albums" className="text-blue-600 hover:underline text-sm mb-4 block">← Back to Albums</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Album</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Summer 2025"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description..."
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Create Album
        </button>
      </form>
    </div>
  );
}
