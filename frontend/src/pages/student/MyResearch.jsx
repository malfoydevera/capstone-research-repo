import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { researchAPI } from '../../utils/api';
import { 
  FileText, Plus, Search, Calendar, CheckCircle, 
  RefreshCcw, Eye, ExternalLink, RefreshCw, AlertTriangle 
} from 'lucide-react';

const MyResearch = () => {
  const navigate = useNavigate();
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); 

  // Ref to track if we are fetching
  const isFetching = useRef(false);

  // --- 1. ROBUST FETCH FUNCTION ---
  const fetchMyPapers = useCallback(async (isBackground = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (!isBackground) setLoading(true);

    try {
      const response = await researchAPI.getMyResearch();
      // SAFETY CHECK: Ensure we have an array
      const allPapers = Array.isArray(response.data.papers) ? response.data.papers : [];
      
      setPapers(allPapers);
      setLastUpdated(new Date());
      setError(null);

    } catch (err) {
      console.error("Fetch error:", err);
      // DETECT LOGOUT: If server restarted and token is dead
      if (err.response && err.response.status === 401) {
        setError("SESSION_EXPIRED");
      } else if (!isBackground) {
        setError("Could not load papers.");
      }
    } finally {
      if (!isBackground) setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // --- 2. AUTO-POLLING & INIT ---
  useEffect(() => {
    fetchMyPapers(); // Initial Load
    const interval = setInterval(() => fetchMyPapers(true), 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchMyPapers]);

  // --- 3. FILTER LOGIC (Simplified) ---
  const filteredPapers = papers.filter(p => {
    // 1. Status Filter
    const matchesStatus = filter === 'all' 
      ? true 
      : p.status === filter; // e.g. 'approved' === 'approved'

    // 2. Search Filter
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            My Research Papers
            <button onClick={() => fetchMyPapers(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
             <span className="flex items-center gap-1 text-green-600 font-bold">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Sync Active
             </span>
             {lastUpdated && <span>• Last check: {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>
        <button onClick={() => navigate('/student/submit')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
          <Plus size={20} /> Submit New
        </button>
      </div>

      {/* SESSION ERROR ALERT */}
      {error === "SESSION_EXPIRED" && (
        <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" />
            <span className="font-bold">Connection Lost. Please log in again to see updates.</span>
          </div>
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-white text-red-600 font-bold rounded shadow-sm hover:bg-red-50">Log In</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search title..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading && papers.length === 0 ? (
        <div className="text-center py-20 text-gray-500 flex flex-col items-center">
          <RefreshCw className="animate-spin mb-2" /> Loading your work...
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500">No papers found.</p>
          {papers.length > 0 && <p className="text-xs text-gray-400 mt-1">(Try changing the filter to "All")</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPapers.map(paper => (
            <div key={paper.id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-all ${paper.status === 'approved' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-400'}`}>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400 flex gap-1"><Calendar size={12}/> {new Date(paper.created_at).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <a href={paper.file_url} target="_blank" rel="noreferrer" className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Eye size={18}/></a>
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${paper.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {paper.status}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{paper.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{paper.abstract}</p>
              
              {paper.status === 'approved' && (
                <div className="mt-auto bg-green-50 p-3 rounded-lg flex items-center justify-center gap-2 text-green-700 font-bold text-sm">
                   <CheckCircle size={16} /> Published & Live
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResearch;