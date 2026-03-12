import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { getAlbums } from '../api/albums';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

export default function DashboardPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAlbums()
      .then((res) => setAlbums(res.data))
      .catch((err) => {
        if (err.response?.status === 401) setError('You must be logged in.');
        else setError('Failed to load albums.');
      });
  }, []);

  // ✅ TEST BACKEND AUTH (robust)
  const testBackend = async () => {
    try {
      const u = auth.currentUser;

      if (!u) {
        alert('No Firebase user yet. Log in first (or wait a second after login).');
        return;
      }

      // force-refresh token (avoids stale tokens)
      const token = await u.getIdToken(true);

      const res = await fetch('http://localhost:8080/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text(); // read raw body first (safe)

      console.log('STATUS:', res.status);
      console.log('BODY:', text);

      if (!res.ok) {
        alert(`Backend returned ${res.status}:\n\n${text}`);
        return;
      }

      // Try to parse JSON (if it's JSON), else show text
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      console.log('Parsed:', data);
      alert('✅ Backend auth works! Check console.');
    } catch (err) {
      console.error('Backend call failed:', err);
      alert(`Backend call failed:\n${err?.message || err}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome, {user?.name || user?.email || 'User'}!
      </h1>
      <p className="text-gray-500 mb-6">Here's a summary of your photo albums.</p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* ✅ TEST BUTTON */}
      <button
        onClick={testBackend}
        className="mb-6 px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
      >
        Test Backend Auth
      </button>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Your Albums</h2>
        <Link
          to="/albums/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + New Album
        </Link>
      </div>

      {albums.length === 0 ? (
        <p className="text-gray-400">No albums yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {albums.slice(0, 4).map((album) => (
            <Link
              key={album.id}
              to={`/albums/${album.id}`}
              className="p-4 bg-white border rounded-xl hover:shadow transition"
            >
              <h3 className="font-medium text-gray-800">{album.title}</h3>
              <p className="text-sm text-gray-400">{album.photoCount ?? 0} photos</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link to="/albums" className="text-blue-600 hover:underline text-sm">
          View all albums
        </Link>
        <Link to="/profile" className="text-blue-600 hover:underline text-sm">
          My Profile
        </Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="text-red-600 hover:underline text-sm">
            Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
}