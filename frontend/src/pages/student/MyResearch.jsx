import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, Eye } from 'lucide-react';
import { researchAPI } from '../../utils/api';

const MyResearch = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initial fetch
    fetchMyResearch();

    // Set up polling interval for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchMyResearch();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchMyResearch = async () => {
    try {
      const response = await researchAPI.getMyResearch();
      setPapers(response.data.papers);
    } catch (err) {
      // Only set error on initial load to avoid flashing errors during polling
      if (loading) {
        setError('Failed to load research papers');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending Review'
      },
      under_review: {
        color: 'bg-blue-100 text-blue-800',
        icon: Eye,
        label: 'Under Review'
      },
      approved: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Approved'
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Research</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your submitted research papers and their status
          </p>
        </div>
        <button
          onClick={() => navigate('/student/submit')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Submit New Research
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {papers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No research papers yet</h3>
          <p className="text-gray-600 mb-6">
            Start by submitting your first research paper
          </p>
          <button
            onClick={() => navigate('/student/submit')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Submit Research Paper
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {paper.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {paper.abstract}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(paper.status)}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{paper.file_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Submitted {formatDate(paper.submission_date)}</span>
                  </div>
                  {paper.published_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>Published {formatDate(paper.published_date)}</span>
                    </div>
                  )}
                </div>

                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {paper.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {paper.rejection_reason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{paper.rejection_reason}</p>
                  </div>
                )}

                {paper.revision_notes && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 mb-1">Revision Notes:</p>
                    <p className="text-sm text-orange-700">{paper.revision_notes}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <a
                    href={paper.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View PDF
                  </a>
                  {(paper.status === 'rejected' || paper.status === 'revision_required') && (
                    <button
                      onClick={() => navigate('/student/submit', { state: { resubmit: paper } })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Resubmit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResearch;