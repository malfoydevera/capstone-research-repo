import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { researchAPI } from '../../utils/api';

const SubmitResearch = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Initialize location to access passed state
  
  // Check if we are in "Resubmit" mode by looking for data passed from MyResearch.jsx
  const resubmitData = location.state?.resubmit; 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  
  // Initialize formData with resubmitData if it exists
  const [formData, setFormData] = useState({
    title: resubmitData?.title || '',
    abstract: resubmitData?.abstract || '',
    keywords: resubmitData?.keywords?.join(', ') || '',
    coAuthors: resubmitData?.co_authors || '',
    category: resubmitData?.category || ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await researchAPI.getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // If not resubmitting, a file is mandatory. 
    // If resubmitting, you might allow them to keep the old file (optional based on preference).
    if (!file && !resubmitData) {
      setError('Please upload a PDF file');
      return;
    }

    if (!formData.title || !formData.abstract || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // MANDATORY: If resubmitting, append the ID so the backend knows to UPDATE
      if (resubmitData?.id) {
        submitData.append('id', resubmitData.id);
      }

      if (file) {
        submitData.append('file', file);
      }
      
      submitData.append('title', formData.title);
      submitData.append('abstract', formData.abstract);
      submitData.append('keywords', formData.keywords);
      submitData.append('coAuthors', formData.coAuthors);
      submitData.append('category', formData.category);

      await researchAPI.submitResearch(submitData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/my-research');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit research');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {resubmitData ? 'Resubmit Research Revision' : 'Submit Research Paper'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {resubmitData 
            ? `Updating: ${resubmitData.title}` 
            : 'Upload your research paper for review and approval'}
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-green-800 font-medium">Research submitted successfully!</p>
            <p className="text-green-700 text-sm mt-1">
              Your research has been sent for review. You'll be notified once it's reviewed.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Research Paper (PDF) {resubmitData ? '(Optional if keeping current)' : <span className="text-red-500">*</span>}
            </label>
            
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                {isDragActive ? (
                  <p className="text-indigo-600 font-medium">Drop your PDF here...</p>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium mb-1">
                      {resubmitData 
                        ? 'Drag & drop a new PDF to replace the old one, or click to browse'
                        : 'Drag & drop your PDF here, or click to browse'}
                    </p>
                    <p className="text-gray-500 text-sm">Maximum file size: 10MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="text-red-600" size={32} />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            )}
            {resubmitData && !file && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Current file: {resubmitData.file_name}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Research Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your research title"
              required
            />
          </div>

          {/* Abstract */}
          <div>
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Provide a brief summary of your research"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
          </div>

          {/* Co-Authors */}
          <div>
            <label htmlFor="coAuthors" className="block text-sm font-medium text-gray-700 mb-2">
              Co-Authors (Optional)
            </label>
            <input
              type="text"
              id="coAuthors"
              name="coAuthors"
              value={formData.coAuthors}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Doe, Jane Smith"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/my-research')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : resubmitData ? 'Update Research' : 'Submit Research'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitResearch;