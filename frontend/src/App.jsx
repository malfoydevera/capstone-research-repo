import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import StudentDashboard from './pages/student/StudentDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SubmitResearch from './pages/student/SubmitResearch';
import MyResearch from './pages/student/MyResearch';
import BrowseRepository from './pages/student/BrowseRepository';
import ReviewSubmissions from './pages/staff/ReviewSubmissions';
import ReviewDetail from './pages/staff/ReviewDetail';
import AdminReviewSubmissions from './pages/admin/AdminReviewSubmissions';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600">403</h1>
      <p className="mt-4 text-xl text-gray-700">Unauthorized Access</p>
      <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            
            {/* Student Routes */}
            <Route path="/student/my-research" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyResearch />
              </ProtectedRoute>
            } />
            <Route path="/student/submit" element={
              <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                <SubmitResearch />
              </ProtectedRoute>
            } />
            <Route path="/student/browse" element={
              <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                <BrowseRepository />
              </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff/review" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ReviewSubmissions />
              </ProtectedRoute>
            } />
            <Route path="/staff/review/:id" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ReviewDetail />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/papers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReviewSubmissions />
              </ProtectedRoute>
            } />
            <Route path="/admin/review/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReviewDetail />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;