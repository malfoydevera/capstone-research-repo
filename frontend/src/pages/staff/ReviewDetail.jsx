import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  Shield,
  BookOpen,
  Tag,
  Users,
  Mail,
  GraduationCap,
  Clock,
  FileCheck,
  Edit,
  Sparkles,
  Award,
  BarChart3,
  ChevronRight,
  Star,
  Lightbulb,
  ShieldCheck,
  Bookmark,
  Copy,
  Printer,
  Share2,
  Eye  // Added this import
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
  const [activeTab, setActiveTab] = useState('overview');

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
    if (!comments.trim()) {
      alert('Please provide approval comments');
      return;
    }

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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'from-yellow-500 to-amber-500',
        badgeColor: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending Review'
      },
      under_review: {
        color: 'from-blue-500 to-cyan-500',
        badgeColor: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200',
        icon: Eye,  // Now Eye is properly imported
        label: 'Under Review'
      },
      approved: {
        color: 'from-green-500 to-emerald-500',
        badgeColor: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: {
        color: 'from-red-500 to-pink-500',
        badgeColor: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Rejected'
      },
      revision_required: {
        color: 'from-orange-500 to-amber-500',
        badgeColor: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200',
        icon: AlertCircle,
        label: 'Revision Required'
      }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-slate-600 animate-pulse">Loading research details...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/staff/review')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-white border border-slate-300 text-slate-700 hover:border-indigo-300 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to Review Queue
        </button>
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Research paper not found</h2>
          <p className="text-slate-600 mb-8">The requested research paper could not be loaded.</p>
          <button
            onClick={() => navigate('/staff/review')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300"
          >
            Return to Review Queue
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(paper.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/staff/review')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-white border border-slate-300 text-slate-700 hover:border-indigo-300 transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Review Queue
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
                <FileCheck size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                  Review <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Submission</span>
                </h1>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${statusConfig.badgeColor} border`}>
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                  <span className="text-sm text-slate-600 font-medium">
                    Submitted {formatDate(paper.submission_date || paper.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                <Shield size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-slate-700">Academic Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Paper Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Paper Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                  <BookOpen size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Research Details</h2>
                  <p className="text-slate-600 text-sm">Complete submission information</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{paper.title}</h3>

              {/* Author Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Primary Author</p>
                    <p className="text-lg font-bold text-slate-900">{paper.users?.full_name || 'Researcher'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-600">{paper.users?.email || 'Email not available'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Submission Timeline</p>
                    <p className="text-lg font-bold text-slate-900">{formatDate(paper.submission_date || paper.created_at)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-600">Submitted recently</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Authors */}
              {paper.co_authors && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={18} className="text-indigo-600" />
                    <h4 className="text-lg font-bold text-slate-900">Co-Authors</h4>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <p className="text-slate-700">{paper.co_authors}</p>
                  </div>
                </div>
              )}

              {/* Abstract */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-indigo-600" />
                  <h4 className="text-lg font-bold text-slate-900">Abstract</h4>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{paper.abstract}</p>
                </div>
              </div>

              {/* Keywords */}
              {paper.keywords && paper.keywords.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={18} className="text-indigo-600" />
                    <h4 className="text-lg font-bold text-slate-900">Keywords</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 text-sm font-medium border border-indigo-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* File Actions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-indigo-600" />
                  <h4 className="text-lg font-bold text-slate-900">Research Document</h4>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                      <FileText size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{paper.file_name}</p>
                      <p className="text-sm text-slate-600">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={paper.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-white border border-slate-300 text-slate-700 hover:border-indigo-300 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Preview
                    </a>
                    <a
                      href={paper.file_url}
                      download
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-8">
          {/* Review Actions */}
          {(paper.status === 'pending' || paper.status === 'under_review') && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                    <FileCheck size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Review Actions</h3>
                    <p className="text-slate-600 text-sm">Make your decision</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl group"
                  >
                    <CheckCircle size={20} />
                    Approve Research
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl group"
                  >
                    <AlertCircle size={20} />
                    Request Revision
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl group"
                  >
                    <XCircle size={20} />
                    Reject Paper
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <Lightbulb size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Review Guidelines</p>
                      <p className="text-sm text-blue-700">
                        Provide constructive feedback to help students improve their research.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Timeline */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                  <Clock size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Review Timeline</h3>
                  <p className="text-slate-600 text-sm">Submission progress</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Submitted</p>
                    <p className="text-sm text-slate-600">{formatDate(paper.submission_date || paper.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${paper.status === 'pending' || paper.status === 'under_review' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'} flex items-center justify-center flex-shrink-0`}>
                    <FileCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Under Review</p>
                    <p className="text-sm text-slate-600">Faculty evaluation in progress</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${paper.status === 'approved' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'} flex items-center justify-center flex-shrink-0`}>
                    <ShieldCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Final Decision</p>
                    <p className="text-sm text-slate-600">Awaiting review completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                  <BarChart3 size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Quick Stats</h3>
                  <p className="text-slate-600 text-sm">Submission metrics</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="text-2xl font-black text-slate-900">1</div>
                  <div className="text-sm text-slate-600 font-medium">Author</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="text-2xl font-black text-slate-900">{paper.keywords?.length || 0}</div>
                  <div className="text-sm text-slate-600 font-medium">Keywords</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="text-2xl font-black text-slate-900">0</div>
                  <div className="text-sm text-slate-600 font-medium">Downloads</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <div className="text-2xl font-black text-slate-900">0</div>
                  <div className="text-sm text-slate-600 font-medium">Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Approve Research</h3>
                  <p className="text-slate-600 text-sm">Approve this research paper</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Please provide your approval comments. These will be shared with the author.
              </p>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your approval comments (required)..."
                rows={4}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Approving...
                    </div>
                  ) : 'Approve Research'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <XCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Reject Research</h3>
                  <p className="text-slate-600 text-sm">Reject this research paper</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Please provide a detailed reason for rejection. This will be shared with the author.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (required)..."
                rows={4}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 font-medium mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Rejecting...
                    </div>
                  ) : 'Reject Paper'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Request Revision</h3>
                  <p className="text-slate-600 text-sm">Request revisions for this paper</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Provide specific revision notes to help the author improve their research.
              </p>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Enter revision notes (required)..."
                rows={4}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 font-medium mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestRevision}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : 'Request Revision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;