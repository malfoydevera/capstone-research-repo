import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { researchAPI } from '../../utils/api'; // Import API
import { 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  BookOpen, 
  LogOut, 
  ChevronLeft, 
  Menu,
  FileSearch,
  CalendarDays,
  Users,
  FileText,
  Upload,
  Bell,
  HelpCircle,
  User,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({ staffPending: 0, adminPending: 0 }); // State for badges
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only fetch stats if user is staff or admin
    if (user?.role === 'staff' || user?.role === 'admin') {
      fetchBadgeStats();
      
      // Auto-refresh badges every 10 seconds
      const interval = setInterval(fetchBadgeStats, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchBadgeStats = async () => {
    try {
      // We can reuse getAllResearch to get counts
      const response = await researchAPI.getAllResearch();
      const papers = response.data.papers;
      
      // Calculate counts based on role needs
      const staffCount = papers.filter(p => p.status === 'pending' || p.status === 'under_review').length;
      const adminCount = papers.filter(p => p.status === 'under_review').length;
      
      setStats({
        staffPending: staffCount,
        adminPending: adminCount
      });
    } catch (error) {
      console.error('Failed to fetch sidebar stats');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuConfig = {
    admin: [
      { 
        name: 'Dashboard', 
        icon: LayoutDashboard, 
        path: '/dashboard',
        badge: null 
      },
      { 
        name: 'User Management', 
        icon: Users, 
        path: '/admin/users',
        badge: null 
      },
      { 
        name: 'Research Papers', 
        icon: FileText, 
        path: '/admin/papers',
        badge: stats.adminPending > 0 ? stats.adminPending : null // Dynamic Badge
      },
      { 
        name: 'Analytics', 
        icon: BarChart3, 
        path: '/admin/analytics',
        badge: null 
      },
      { 
        name: 'Settings', 
        icon: Settings, 
        path: '/admin/settings',
        badge: null 
      },
    ],
    staff: [
      { 
        name: 'Dashboard', 
        icon: LayoutDashboard, 
        path: '/dashboard',
        badge: null 
      },
      { 
        name: 'Review Submissions', 
        icon: BookOpen, 
        path: '/staff/review',
        badge: stats.staffPending > 0 ? stats.staffPending : null // Dynamic Badge
      },
      { 
        name: 'My Research', 
        icon: FileText, 
        path: '/staff/my-research',
        badge: null 
      },
      { 
        name: 'Manage Schedule', 
        icon: CalendarDays, 
        path: '/staff/schedule',
        badge: null 
      },
      { 
        name: 'Settings', 
        icon: Settings, 
        path: '/staff/settings',
        badge: null 
      },
    ],
    student: [
      { 
        name: 'Dashboard', 
        icon: LayoutDashboard, 
        path: '/dashboard',
        badge: null 
      },
      { 
        name: 'My Research', 
        icon: BookOpen, 
        path: '/student/my-research',
        badge: null 
      },
      { 
        name: 'Submit Research', 
        icon: Upload, 
        path: '/student/submit',
        badge: null 
      },
      { 
        name: 'Browse Repository', 
        icon: FileSearch, 
        path: '/student/browse',
        badge: null 
      },
    ]
  };

  const menuItems = menuConfig[user?.role] || [];

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'staff':
        return 'bg-purple-100 text-purple-700';
      case 'student':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col sticky top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-indigo-600 text-lg">ResearchHub</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <Shield size={18} className="text-white" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user?.role)}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} />
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.name}
                  {item.badge && <span className="ml-1 text-red-400">({item.badge})</span>}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100">
        {/* Help Button */}
        <div className="p-3">
          <Link
            to="/help"
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group relative`}
          >
            <HelpCircle size={20} className="text-gray-400 group-hover:text-gray-600" />
            {!isCollapsed && <span className="font-medium">Help & Support</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Help & Support
              </div>
            )}
          </Link>
        </div>

        {/* Logout Button */}
        <div className="p-3">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;