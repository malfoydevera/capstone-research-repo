import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { researchAPI } from '../../utils/api';
import { RefreshCw, Users, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [stats, setStats] = useState({ totalUsers: 0, totalPapers: 0, pendingReviews: 0, published: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (!isBackground) setLoading(true);

    try {
      const { data } = await researchAPI.getAllResearch();
      const allPapers = data.papers || [];

      const published = allPapers.filter(p => p.status === 'approved').length;
      const pendingAdmin = allPapers.filter(p => p.status === 'under_review').length;
      const uniqueAuthors = new Set(allPapers.map(p => p.author_id)).size;

      setStats({
        totalUsers: uniqueAuthors,
        totalPapers: allPapers.length,
        pendingReviews: pendingAdmin,
        published: published
      });

      // Sort by newest first
      const recent = allPapers
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);
      
      setRecentActivity(recent);

    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      if (!isBackground) setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData, location.key]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'under_review': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            System Overview 
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
            </span>
          </p>
        </div>
        
        <button 
          onClick={() => fetchDashboardData(false)} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium text-gray-500">Active Authors</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</h3></div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium text-gray-500">Total Papers</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPapers}</h3></div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={24} /></div>
          </div>
        </div>

        {/* Pending Card - Highlighted */}
        <div 
          onClick={() => navigate('/admin/reviews')}
          className="bg-purple-50 p-6 rounded-xl shadow-sm border border-purple-200 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div><p className="text-sm font-bold text-purple-800 uppercase tracking-wider">Pending Approval</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingReviews}</h3></div>
            <div className="p-3 bg-white text-purple-600 rounded-lg shadow-sm"><Clock size={24} /></div>
          </div>
          <p className="text-xs text-purple-600 mt-4 font-medium flex items-center gap-1">
             Go to Queue <ArrowRight size={12} />
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium text-gray-500">Published</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.published}</h3></div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          </div>
        </div>
      </div>

      {/* Recent Activity List - Redesigned */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-lg">Recent Submissions</h2>
          <button onClick={() => navigate('/admin/reviews')} className="text-sm text-indigo-600 font-bold hover:text-indigo-800">View All</button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? <div className="p-8 text-center text-gray-500">No activity.</div> : recentActivity.map((paper) => (
            <div key={paper.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`w-2 h-2 rounded-full ${paper.status === 'under_review' ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`}></div>
                 <div>
                    <h4 className="font-bold text-gray-900 text-md">{paper.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">by <span className="font-medium text-gray-700">{paper.users?.full_name || 'Unknown'}</span> • {new Date(paper.updated_at).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(paper.status)}`}>{paper.status.replace('_', ' ')}</span>
                
                {/* Direct Action Button for Pending Papers */}
                {paper.status === 'under_review' && (
                  <button 
                    onClick={() => navigate('/admin/reviews')}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;