import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAlbums, deleteAlbum } from '../api/albums';

export default function AlbumListPage() {
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);

  const load = () => {

    getAlbums()
      .then((res) => { setAlbums(res) })
      .catch((err) => {
        if (err.response?.status === 401) setError('401 – Please log in.');
        else setError('Failed to load albums.');
      });
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this album?')) return;
    try {
      await deleteAlbum(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      if (err.response?.status === 403) setError('403 – Not authorized to delete this album.');
      else setError('Failed to delete album.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Albums</h1>
        <Link
          to="/albums/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + New Album
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {!albums || albums.length === 0 ? (
        <p className="text-gray-400">No albums found.</p>
      ) : (
        <ul className="space-y-3">
          {albums.map((album) => (
            <li
              key={album.id}
              className="flex items-center justify-between p-4 bg-white border rounded-xl"
            >
              <div>
                <Link
                  to={`/albums/${album.id}`}
                  className="font-medium text-gray-800 hover:text-blue-600"
                >
                  {album.title}
                </Link>
                {album.description && (
                  <p className="text-sm text-gray-400">{album.description}</p>
                )}
                <p className="text-xs text-gray-300">{album.photoCount ?? 0} photos</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/albums/${album.id}/edit`}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(album.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
