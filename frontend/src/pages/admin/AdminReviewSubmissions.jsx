import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Eye, User, Calendar, Filter, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { researchAPI } from '../../utils/api';

const AdminReviewSubmissions = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('under_review');
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    revisionRequired: 0,
    total: 0
  });

  useEffect(() => {
    fetchPapers();
  }, []);

  useEffect(() => {
    filterPapers();
  }, [papers, statusFilter]);

  const fetchPapers = async () => {
    try {
      const response = await researchAPI.getAllResearch();
      const allPapers = response.data.papers;
      
      setPapers(allPapers);
      
      // Calculate stats
      setStats({
        pending: allPapers.filter(p => p.status === 'pending').length,
        underReview: allPapers.filter(p => p.status === 'under_review').length,
        approved: allPapers.filter(p => p.status === 'approved').length,
        rejected: allPapers.filter(p => p.status === 'rejected').length,
        revisionRequired: allPapers.filter(p => p.status === 'revision_required').length,
        total: allPapers.length
      });
    } catch (error) {
      console.error('Failed to fetch papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPapers = () => {
    let filtered = papers;
    
    if (statusFilter === 'all') {
      filtered = papers;
    } else if (statusFilter === 'needs_action') {
      filtered = papers.filter(p => p.status === 'pending' || p.status === 'under_review');
    } else {
      filtered = papers.filter(p => p.status === statusFilter);
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
    
    setFilteredPapers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending Staff Review'
      },
      under_review: {
        color: 'bg-blue-100 text-blue-800',
        icon: Eye,
        label: 'Awaiting Final Approval'
      },
      approved: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Published'
      },
      rejected: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Rejected'
      },
      revision_required: {
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle,
        label: 'Revision Required'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Research Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and publish research submissions (Final Approval)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Papers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Awaiting Approval</p>
              <p className="text-3xl font-bold text-blue-600">{stats.underReview}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Staff Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('under_review')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'under_review'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Awaiting Final Approval ({stats.underReview})
            </button>
            <button
              onClick={() => setStatusFilter('needs_action')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'needs_action'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Needs Action ({stats.pending + stats.underReview})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Staff Review ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Published ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Papers ({stats.total})
            </button>
          </div>
        </div>
      </div>

      {/* Papers List */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600">
            {statusFilter === 'under_review' 
              ? 'No papers awaiting final approval at the moment.'
              : `No papers with status: ${statusFilter.replace('_', ' ')}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/review/${paper.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {paper.title}
                      </h3>
                      {getStatusBadge(paper.status)}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {paper.abstract}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{paper.users?.full_name || 'Unknown Author'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Submitted {formatDate(paper.submission_date)}</span>
                  </div>
                  {paper.published_date && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} />
                      <span>Published {formatDate(paper.published_date)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{paper.file_name}</span>
                  </div>
                </div>

                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {paper.keywords.slice(0, 5).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/review/${paper.id}`);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    {paper.status === 'under_review' ? 'Final Approval Required →' : 'View Details →'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewSubmissions;