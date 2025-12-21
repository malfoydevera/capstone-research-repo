import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { researchAPI } from '../../utils/api';
import { 
  CheckCircle, XCircle, RefreshCcw, FileText, ArrowRight, X, RefreshCw, AlertCircle
} from 'lucide-react';

const AdminResearchReview = () => {
  const location = useLocation();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [comment, setComment] = useState('');
  const isFetching = useRef(false);

  const fetchAdminQueue = useCallback(async (isBackground = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (!isBackground) setLoading(true);

    try {
      const response = await researchAPI.getAllResearch('under_review');
      setPapers(response.data.papers || []);
    } catch (err) {
      console.error("Error fetching admin queue:", err);
    } finally {
      if (!isBackground) setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => { fetchAdminQueue(); }, [fetchAdminQueue, location.key]);

  const handleFinalDecision = async (decision) => {
    if (!comment && decision !== 'approve') return alert("Please add a comment.");
    
    try {
      if (decision === 'approve') await researchAPI.approveResearch(selectedPaper.id, comment);
      else if (decision === 'reject') await researchAPI.rejectResearch(selectedPaper.id, comment);
      else if (decision === 'revision') await researchAPI.requestRevision(selectedPaper.id, comment);

      alert(`Success! Paper marked as ${decision}.`);
      setSelectedPaper(null);
      setComment('');
      fetchAdminQueue(false);
      
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Publication Queue
            <button 
              onClick={() => fetchAdminQueue(false)} 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and publish papers approved by staff.</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-bold border border-purple-100">
           <AlertCircle size={18} />
           {papers.length} Waiting
        </div>
      </div>

      {/* Grid Layout for Better UI */}
      {loading && papers.length === 0 ? (
           <div className="p-20 text-center text-gray-500"><RefreshCw className="animate-spin mx-auto mb-2" /> Loading Queue...</div>
      ) : papers.length === 0 ? (
        <div className="text-center p-16 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500 mt-2">No papers waiting for publication.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all flex flex-col h-full overflow-hidden group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                      Review Needed
                   </span>
                   <span className="text-xs text-gray-400">{new Date(paper.created_at).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-purple-700 transition-colors">{paper.title}</h3>
                <p className="text-sm text-gray-600 mb-4">By <span className="font-semibold">{paper.users?.full_name}</span></p>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{paper.abstract}"</p>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                 <a href={paper.file_url} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <FileText size={16} /> PDF
                 </a>
                 <button onClick={() => setSelectedPaper(paper)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm transition-colors">
                    Decide <ArrowRight size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improved Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Final Decision</h2>
                <p className="text-xs text-gray-500 mt-0.5">ID: {selectedPaper.id}</p>
              </div>
              <button onClick={() => setSelectedPaper(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 text-gray-900">{selectedPaper.title}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <a href={selectedPaper.file_url} target="_blank" className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    <FileText size={20} /> View Full PDF
                 </a>
                 <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-600 font-bold rounded-lg border border-gray-200">
                    <CheckCircle size={20} className="text-green-500" /> Staff Approved
                 </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">Publication Note / Feedback</label>
              <textarea 
                className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50 focus:bg-white transition-colors" 
                placeholder="Enter comments (required for rejection)..." 
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => handleFinalDecision('approve')} className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all hover:scale-[1.02]">
                  <CheckCircle size={20} /> Publish
                </button>
                <button onClick={() => handleFinalDecision('revision')} className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-200 transition-all hover:scale-[1.02]">
                  <RefreshCcw size={20} /> Revision
                </button>
                <button onClick={() => handleFinalDecision('reject')} className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all hover:scale-[1.02]">
                  <XCircle size={20} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResearchReview;