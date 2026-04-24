import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <Navbar orgName={user?.organizationName || 'Task Manager'} />
      <main className="min-h-screen p-4 pt-20 md:ml-72 md:p-8 md:pt-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><AppLayout><TaskListPage /></AppLayout></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><AppLayout><TaskDetailPage /></AppLayout></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute adminOnly><AppLayout><TeamPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
