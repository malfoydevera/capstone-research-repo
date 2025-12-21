import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Search, TrendingUp } from 'lucide-react';
import { researchAPI } from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    revisionRequired: 0
  });
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await researchAPI.getMyResearch();
      const papers = response.data.papers;

      // Calculate statistics
      const statistics = {
        total: papers.length,
        pending: papers.filter(p => p.status === 'pending').length,
        underReview: papers.filter(p => p.status === 'under_review').length,
        approved: papers.filter(p => p.status === 'approved').length,
        rejected: papers.filter(p => p.status === 'rejected').length,
        revisionRequired: papers.filter(p => p.status === 'revision_required').length
      };

      setStats(statistics);
      setRecentPapers(papers.slice(0, 3)); // Get 3 most recent
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      under_review: 'text-blue-600 bg-blue-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      revision_required: 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening with your research today.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">In Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending + stats.underReview}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Pending + Under Review</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Approved papers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Needs Action</p>
              <p className="text-3xl font-bold text-orange-600">{stats.revisionRequired}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Revision required</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/student/submit')}
            className="flex items-center gap-3 px-6 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-white"
          >
            <Upload size={24} />
            <div className="text-left">
              <p className="font-semibold">Submit Research</p>
              <p className="text-sm text-indigo-100">Upload new paper</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/student/my-research')}
            className="flex items-center gap-3 px-6 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-white"
          >
            <FileText size={24} />
            <div className="text-left">
              <p className="font-semibold">My Research</p>
              <p className="text-sm text-indigo-100">View submissions</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/student/browse')}
            className="flex items-center gap-3 px-6 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-white"
          >
            <Search size={24} />
            <div className="text-left">
              <p className="font-semibold">Browse Repository</p>
              <p className="text-sm text-indigo-100">Explore papers</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
          <button
            onClick={() => navigate('/student/my-research')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All →
          </button>
        </div>
        
        {recentPapers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-4">No submissions yet</p>
            <button
              onClick={() => navigate('/student/submit')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit Your First Paper
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentPapers.map((paper) => (
              <div key={paper.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{paper.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{paper.abstract}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Submitted {formatDate(paper.submission_date)}</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(paper.status)}`}>
                        {paper.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Tips for Success</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Ensure your research title is clear and descriptive</li>
              <li>• Write a comprehensive abstract (150-250 words recommended)</li>
              <li>• Add relevant keywords to improve discoverability</li>
              <li>• Make sure your PDF is well-formatted and readable</li>
              <li>• Respond promptly to revision requests from reviewers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;