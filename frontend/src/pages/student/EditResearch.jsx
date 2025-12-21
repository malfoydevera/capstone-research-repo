import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { researchAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const EditResearch = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [file, setFile] = useState(null); // New file (if uploading)
  const [currentFile, setCurrentFile] = useState(null); // Existing file info
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    coAuthors: '',
    category: ''
  });

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, paperRes] = await Promise.all([
          researchAPI.getCategories(),
          researchAPI.getResearchById(id)
        ]);

        setCategories(catRes.data.categories || []);
        
        const paper = paperRes.data.paper;
        setFormData({
          title: paper.title,
          abstract: paper.abstract,
          keywords: Array.isArray(paper.keywords) ? paper.keywords.join(', ') : paper.keywords,
          coAuthors: paper.co_authors || '',
          category: paper.category
        });
        
        // Store existing file info so we don't force re-upload
        setCurrentFile({
          url: paper.file_url,
          name: paper.file_name,
          size: paper.file_size
        });

      } catch (err) {
        setError("Failed to load research details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Dropzone for NEW file
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let uploadData = { 
        publicUrl: currentFile.url, 
        fileName: currentFile.name, 
        fileSize: currentFile.size 
      };

      // 1. If a NEW file is selected, upload it
      if (file) {
        uploadData = await researchAPI.uploadFile(file, user.id);
      }

      // 2. Submit Update
      const updatePayload = {
        title: formData.title,
        abstract: formData.abstract,
        keywords: formData.keywords,
        co_authors: formData.coAuthors,
        category: formData.category,
        file_url: uploadData.publicUrl,
        file_name: uploadData.fileName,
        file_size: uploadData.fileSize
      };

      await researchAPI.updateResearch(id, updatePayload);
      alert("Research resubmitted successfully!");
      navigate('/student/my-research');

    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit & Resubmit Research</h1>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        
        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Research Paper (PDF)</label>
          
          {/* Show Current File if no new file selected */}
          {!file && currentFile && (
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Current File: {currentFile.name}</p>
                  <p className="text-xs text-indigo-600">Re-uploading is optional. Drop a new file below to replace this.</p>
                </div>
              </div>
            </div>
          )}

          {/* New File Dropzone */}
          {!file ? (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              <Upload className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Click or drag new PDF to replace</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded bg-green-50">
              <span className="flex items-center gap-2 text-green-700 font-medium"><FileText size={16}/> New: {file.name}</span>
              <button type="button" onClick={() => setFile(null)}><X size={18} className="text-gray-500"/></button>
            </div>
          )}
        </div>

        {/* Standard Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input 
            className="w-full p-2 border rounded" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abstract</label>
          <textarea 
            className="w-full p-2 border rounded" 
            rows="5" 
            value={formData.abstract} 
            onChange={e => setFormData({...formData, abstract: e.target.value})} 
            required 
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium mb-1">Category</label>
             <select 
               className="w-full p-2 border rounded" 
               value={formData.category} 
               onChange={e => setFormData({...formData, category: e.target.value})}
               required
             >
               <option value="">Select...</option>
               {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keywords</label>
            <input 
              className="w-full p-2 border rounded" 
              value={formData.keywords} 
              onChange={e => setFormData({...formData, keywords: e.target.value})} 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/student/my-research')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            {submitting ? 'Resubmitting...' : 'Resubmit Research'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditResearch;