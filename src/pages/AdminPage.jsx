import { useEffect, useState } from 'react';
import { getAllUsers, patchUser, deleteUser } from '../api/users';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const load = () => {
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => {
        if (err.response?.status === 401) setError('401 – Please log in.');
        else if (err.response?.status === 403) setError('403 – Admin access required.');
        else setError('Failed to load users.');
      });
  };

  useEffect(load, []);

  const handleToggleAdmin = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await patchUser(user.id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
    } catch (err) {
      if (err.response?.status === 403) setError('403 – Not authorized.');
      else setError('Failed to update user.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Failed to delete user.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <table className="w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Role</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-3 text-gray-800">{user.name}</td>
              <td className="px-4 py-3 text-gray-500">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-2 justify-end">
                <button
                  onClick={() => handleToggleAdmin(user)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  {user.role === 'ADMIN' ? 'Revoke Admin' : 'Grant Admin'}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
