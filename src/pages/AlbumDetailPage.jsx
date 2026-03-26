import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAlbum, updateAlbum, deleteAlbum } from '../api/albums';
import { getPhotos, addPhoto, deletePhotos } from '../api/photos';

export default function AlbumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    getAlbum(id)
      .then((res) => {
        setAlbum(res.data);
        setForm({ title: res.data.title, description: res.data.description || '' });
      })
      .catch((err) => {
        if (err.response?.status === 404) setError('404 – Album not found.');
        else if (err.response?.status === 401) setError('401 – Please log in.');
        else setError('Failed to load album.');
      });

    getPhotos(id)
      .then((res) => setPhotos(res.data))
      .catch(() => {});
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await updateAlbum(id, form);
      setAlbum(res.data);
      setEditing(false);
    } catch (err) {
      if (err.response?.status === 403) setError('403 – Not authorized to edit this album.');
      else setError('Failed to update album.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this album and all its photos?')) return;
    try {
      await deleteAlbum(id);
      navigate('/albums');
    } catch (err) {
      if (err.response?.status === 403) setError('403 – Not authorized.');
      else setError('Failed to delete album.');
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    try {
      const res = await addPhoto(id, { url: newPhotoUrl });
      setPhotos((prev) => [res.data, ...prev]);
      setNewPhotoUrl('');
    } catch {
      setError('Failed to add photo.');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deletePhotos(id, [photoId]);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setError('Failed to delete photo.');
    }
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!album) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/albums" className="text-blue-600 hover:underline text-sm mb-4 block">← Back to Albums</Link>

      {editing ? (
        <div className="mb-6 space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2 text-gray-800"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Album title"
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-gray-800 resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={3}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{album.title}</h1>
              {album.description && <p className="text-gray-500 mt-1">{album.description}</p>}
              <p className="text-xs text-gray-400 mt-1">Created: {new Date(album.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Edit</button>
              <button onClick={handleDelete} className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete Album</button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Photos</h2>
        <form onSubmit={handleAddPhoto} className="flex gap-2 mb-4">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="Photo URL (e.g. https://imgur.com/...)"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
        </form>

        {photos.length === 0 ? (
          <p className="text-gray-400 text-sm">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img src={photo.url} alt="" className="w-full h-36 object-cover rounded-lg" />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
