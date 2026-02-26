import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-gray-800 text-lg">📷 Photo Albums</Link>
        <Link to="/albums" className="text-sm text-gray-600 hover:text-blue-600">Albums</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="text-sm text-red-600 hover:text-red-700">Admin</Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">{user?.name || user?.email}</Link>
        <button
          onClick={logout}
          className="text-sm px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
