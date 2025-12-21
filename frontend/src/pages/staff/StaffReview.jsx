import { useState, useEffect, useCallback, useRef } from 'react';
import { researchAPI } from '../../utils/api';
import { 
  CheckCircle, XCircle, RefreshCcw, FileText, X, RefreshCw 
} from 'lucide-react';

const StaffReview = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [comment, setComment] = useState('');
  
  // Ref to prevent overlapping fetches (The Stabilizer)
  const isFetching = useRef(false);

  // --- 1. ROBUST FETCH FUNCTION ---
  const fetchQueue = useCallback(async (isBackground = false) => {
    // If a request is already in progress, STOP. Do not send another.
    if (isFetching.current) return;
    
    isFetching.current = true;
    if (!isBackground) setLoading(true);

    try {
      // Fetch ALL papers
      const response = await researchAPI.getAllResearch();
      const data = response.data.papers || [];
      setPapers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching queue:", err);
      // Only show error on screen if it's the main load
      if (!isBackground) {
         // Show the specific error from the backend (e.g., "Access denied")
         setError(err.response?.data?.error || err.message || "Failed to load.");
      }
    } finally {
      if (!isBackground) setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // --- 2. INITIAL LOAD ---
  useEffect(() => {
    fetchQueue(); 
    // We REMOVED location.key to prevent the "Double Load" crash
  }, [fetchQueue]);

  // --- 3. AUTO-POLLING (Slower & Safer) ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchQueue(true); // Background fetch
    }, 10000); // Increased to 10 seconds to prevent "Rate Limiting" issues

    return () => clearInterval(intervalId);
  }, [fetchQueue]);

  // --- 4. FOCUS LISTENER ---
  useEffect(() => {
    const onFocus = () => fetchQueue(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchQueue]);


  const handleAction = async (actionType) => {
    if (!comment && actionType !== 'approve') return alert("Please add a comment.");

    try {
      if (actionType === 'approve') await researchAPI.approveResearch(selectedPaper.id, comment);
      else if (actionType === 'reject') await researchAPI.rejectResearch(selectedPaper.id, comment);
      else if (actionType === 'revision') await researchAPI.requestRevision(selectedPaper.id, comment);
      
      alert(`Success! Paper moved to ${actionType}.`);
      setSelectedPaper(null);
      setComment('');
      fetchQueue(false); // Immediate refresh
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.error || err.message));
    }
  };

  const getStatusBadge = (status) => {
    const color = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revision_required: 'bg-orange-100 text-orange-800',
    }[status] || 'bg-gray-100 text-gray-800';

    return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Staff Master List
            <button 
              onClick={() => fetchQueue(false)} 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
              title="Force Refresh"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
             <span className="flex items-center gap-1">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Sync
             </span>
          </div>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-bold">
          Total: {papers.length}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium border border-red-100 flex flex-col items-center">
          <p>{error}</p>
          {error.includes("Access denied") && (
             <p className="text-sm mt-1">Your session may have expired. Please Log Out and Log In again.</p>
          )}
          <button onClick={() => fetchQueue(false)} className="mt-2 text-sm underline font-bold">Try Again</button>
        </div>
      )}

      {/* List */}
      {loading && papers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
           <RefreshCw className="animate-spin mx-auto mb-2" /> Loading submissions...
        </div>
      ) : (
        <div className="grid gap-4">
          {papers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">No papers found.</div>
          ) : (
            papers.map((paper) => (
              <div key={paper.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(paper.status)} 
                    <span className="text-xs text-gray-400">ID: {paper.id.slice(0,8)}...</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{paper.title}</h3>
                  <p className="text-sm text-gray-500">{paper.users?.full_name || 'Unknown Author'}</p>
                </div>
                <button 
                  onClick={() => setSelectedPaper(paper)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  {paper.status === 'pending' ? 'Review Now' : 'Edit Status'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedPaper.title}</h2>
              <button onClick={() => setSelectedPaper(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm border border-gray-100">
              <span className="font-bold block text-gray-500 text-xs uppercase mb-1">Current Status</span>
              {getStatusBadge(selectedPaper.status)}
            </div>

            <a href={selectedPaper.file_url} target="_blank" className="block w-full text-center py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg mb-4 border border-indigo-200">
              <FileText className="inline w-5 h-5 mr-2 align-middle" /> Read PDF Document
            </a>

            <label className="block text-sm font-bold text-gray-700 mb-2">Reviewer Feedback</label>
            <textarea 
              className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="Enter comments..." 
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleAction('approve')} className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex flex-col items-center justify-center gap-1"><CheckCircle size={20} /> Approve</button>
              <button onClick={() => handleAction('revision')} className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex flex-col items-center justify-center gap-1"><RefreshCcw size={20} /> Revision</button>
              <button onClick={() => handleAction('reject')} className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex flex-col items-center justify-center gap-1"><XCircle size={20} /> Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReview;