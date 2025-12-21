import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  HelpCircle,
  Shield,
  Activity
} from 'lucide-react';
import { researchAPI } from '../../utils/api';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch real-time count for staff notifications
  useEffect(() => {
    if (user?.role === 'staff' || user?.role === 'admin') {
      const getCounts = async () => {
        try {
          const response = await researchAPI.getAllResearch('pending');
          setPendingCount(response.data.length);
        } catch (err) {
          console.error("Badge fetch error:", err);
        }
      };
      getCounts();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuConfig = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'User Management', icon: Users, path: '/admin/users' },
      { name: 'All Research', icon: FileText, path: '/admin/papers' },
      { name: 'System Status', icon: Activity, path: 'http://localhost:5000/status', external: true },
      { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
    staff: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { 
        name: 'Review Submissions', 
        icon: BookOpen, 
        path: '/staff/review', 
        badge: pendingCount > 0 ? pendingCount.toString() : null 
      },
      { name: 'My Research', icon: FileText, path: '/staff/my-research' },
      { name: 'Manage Schedule', icon: CalendarDays, path: '/staff/schedule' },
    ],
    student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'My Research', icon: BookOpen, path: '/student/my-research' },
      { name: 'Submit Research', icon: Upload, path: '/student/submit' },
      { name: 'Browse Repository', icon: FileSearch, path: '/student/browse' },
    ]
  };

  const menuItems = menuConfig[user?.role] || [];

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'staff': return 'bg-purple-100 text-purple-700';
      case 'student': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col sticky top-0 h-screen z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
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
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full mt-1 ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          const LinkComponent = item.external ? 'a' : Link;
          const linkProps = item.external 
            ? { href: item.path, target: "_blank", rel: "noopener noreferrer" } 
            : { to: item.path };

          return (
            <LinkComponent 
              key={item.name} 
              {...linkProps}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} />
              {!isCollapsed && (
                <>
                  <span className="text-sm flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {item.badge}
                </span>
              )}
            </LinkComponent>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <Link to="/help" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg group">
          <HelpCircle size={20} className="text-gray-400 group-hover:text-gray-600" />
          {!isCollapsed && <span className="font-medium">Support</span>}
        </Link>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;