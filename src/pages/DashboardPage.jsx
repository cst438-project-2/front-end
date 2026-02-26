import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAlbums } from '../api/albums';

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome, {user?.name || user?.email || 'User'}!
      </h1>
      <p className="text-gray-500 mb-6">Here's a summary of your photo albums.</p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

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
        <Link to="/albums" className="text-blue-600 hover:underline text-sm">View all albums</Link>
        <Link to="/profile" className="text-blue-600 hover:underline text-sm">My Profile</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="text-red-600 hover:underline text-sm">Admin Panel</Link>
        )}
      </div>
    </div>
  );
}
