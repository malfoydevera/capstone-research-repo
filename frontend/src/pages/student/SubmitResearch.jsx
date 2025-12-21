import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { researchAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const SubmitResearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    coAuthors: '',
    category: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await researchAPI.getCategories();
      setCategories(response.data.categories || []); 
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
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- THE FIXED SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 1. Validation
    if (!file) {
      setError('Please upload a PDF file');
      return;
    }
    if (!formData.title || !formData.abstract || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // 2. Upload File to Supabase Storage
      const uploadData = await researchAPI.uploadFile(file, user.id);

      // 3. Prepare Metadata
      const submissionData = {
        title: formData.title,
        abstract: formData.abstract,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        co_authors: formData.coAuthors, // Backend handles camelCase or snake_case
        category: formData.category,
        author_id: user.id,
        file_url: uploadData.publicUrl,
        file_name: uploadData.fileName,
        file_size: uploadData.fileSize,
        status: 'pending'
      };

      // 4. Save to Database
      await researchAPI.submitResearch(submissionData);
      
      // 5. SUCCESS & DELAYED REDIRECT (The Fix)
      setSuccess(true);
      
      // We wait 2 seconds here. This allows the database transaction to fully commit
      // BEFORE we send the user to the "My Research" page. 
      // This prevents the "Empty List" bug.
      setTimeout(() => {
        navigate('/student/my-research');
      }, 2000);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit research');
      setSuccess(false); // Reset success if error occurs
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
        <h1 className="text-3xl font-bold text-gray-900">Submit Research Paper</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your research paper for review and approval
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-pulse">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-green-800 font-bold">Success! Redirecting...</p>
            <p className="text-green-700 text-sm mt-1">
              Your paper has been submitted. Taking you to your dashboard to see the status.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Research Paper (PDF) <span className="text-red-500">*</span>
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
                      Drag & drop your PDF here, or click to browse
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
          </div>

          {/* Form Fields Section */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

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

        {/* Action Buttons */}
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
            disabled={loading || success}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Research'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitResearch;