import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import AlbumListPage from './pages/AlbumListPage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import TimelinePage from './pages/TimelinePage';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
function AdminRoute() {
    const { user, loading, isAdmin } = useAuth();

    if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return <Outlet />;
}


function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<TimelinePage />} />
          <Route element={<AdminRoute />}>
            <Route path="/albums" element={<AlbumListPage />} />
          </Route>
          <Route path="/albums/new" element={<CreateAlbumPage />} />
          <Route path="/albums/:id" element={<AlbumDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-6 text-gray-600">404 – Page not found.</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}