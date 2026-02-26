import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUser, deleteCurrentUser } from '../api/users';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCurrentUser(form);
      setUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err.response?.status === 401) setError('401 – Please log in.');
      else setError('Failed to update profile.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete your account and all your data? This cannot be undone.')) return;
    try {
      await deleteCurrentUser();
      logout();
    } catch {
      setError('Failed to delete account.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="mb-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        <p><span className="font-medium">Role:</span> {user?.role || 'USER'}</p>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-green-600 mb-4">Profile updated!</div>}

      <form onSubmit={handleUpdate} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Save Changes
        </button>
      </form>

      <div className="border-t pt-6">
        <h2 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h2>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
