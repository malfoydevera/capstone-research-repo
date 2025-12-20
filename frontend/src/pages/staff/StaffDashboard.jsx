import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Portal</h2>
            
            {/* User Info Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-l-4 border-purple-500 pl-4 bg-gray-50 py-2">
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role || 'Staff Member'}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 bg-gray-50 py-2">
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Review Submissions</h3>
                <p className="text-sm text-purple-700">Review and approve student research papers and project proposals.</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white">📅</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Manage Schedule</h3>
                <p className="text-sm text-blue-700">Update your office hours and consultation availability for students.</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Internal Reports</h3>
                <p className="text-sm text-green-700">Access departmental analytics and student performance summaries.</p>
              </div>
            </div>

            {/* Recent Activity / Tasks Section */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  <li className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-3 h-2 w-2 bg-indigo-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New submission: AI in Healthcare</p>
                        <p className="text-xs text-gray-500">Submitted by John Doe • 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View</button>
                  </li>
                  <li className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-3 h-2 w-2 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Meeting with Faculty Board</p>
                        <p className="text-xs text-gray-500">Scheduled for Tomorrow at 10:00 AM</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Details</button>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;