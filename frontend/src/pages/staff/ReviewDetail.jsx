import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, User, Calendar, Download, ExternalLink, 
  CheckCircle, XCircle, AlertCircle, MessageSquare 
} from 'lucide-react';
import { researchAPI } from '../../utils/api';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  useEffect(() => {
    fetchPaperDetail();
  }, [id]);

  const fetchPaperDetail = async () => {
    try {
      const response = await researchAPI.getResearchById(id);
      setPaper(response.data.paper);
    } catch (error) {
      console.error('Failed to fetch paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await researchAPI.approveResearch(id, comments);
      alert('Research approved successfully!');
      navigate('/staff/review');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve research');
    } finally {
      setActionLoading(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await researchAPI.rejectResearch(id, rejectionReason);
      alert('Research rejected');
      navigate('/staff/review');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject research');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      alert('Please provide revision notes');
      return;
    }

    setActionLoading(true);
    try {
      await researchAPI.requestRevision(id, revisionNotes);
      alert('Revision requested successfully');
      navigate('/staff/review');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to request revision');
    } finally {
      setActionLoading(false);
      setShowRevisionModal(false);
    }
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

  if (!paper) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Research paper not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/staff/review')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Review Queue
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Review Submission</h1>
      </div>

      {/* Paper Details Card */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{paper.title}</h2>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <div>
                <p className="text-xs text-gray-500">Author</p>
                <p className="font-medium">{paper.users?.full_name}</p>
                <p className="text-sm">{paper.users?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="font-medium">{formatDate(paper.submission_date)}</p>
              </div>
            </div>
          </div>

          {/* Co-Authors */}
          {paper.co_authors && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-1">Co-Authors</p>
              <p className="text-gray-600">{paper.co_authors}</p>
            </div>
          )}

          {/* Abstract */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h3>
            <p className="text-gray-700 whitespace-pre-line">{paper.abstract}</p>
          </div>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Research File</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={18} />
                <span>{paper.file_name}</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={paper.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <ExternalLink size={16} />
                  View PDF
                </a>
                <a
                  href={paper.file_url}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(paper.status === 'pending' || paper.status === 'under_review') && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={20} />
              Approve
            </button>
            <button
              onClick={() => setShowRevisionModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <AlertCircle size={20} />
              Request Revision
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle size={20} />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Research</h3>
            <p className="text-gray-600 mb-4">
              This research will be moved to the next approval stage. You can add optional comments.
            </p>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional comments..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Research</h3>
            <p className="text-gray-600 mb-4">
              Please provide a detailed reason for rejection. This will be sent to the author.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Revision</h3>
            <p className="text-gray-600 mb-4">
              Provide specific notes on what needs to be revised. The author will resubmit after making changes.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Revision notes (required)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                disabled={actionLoading}
              >
                {actionLoading ? 'Sending...' : 'Request Revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;