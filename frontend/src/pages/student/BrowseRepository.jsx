import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Tag, FileText, ExternalLink } from 'lucide-react';
import { researchAPI } from '../../utils/api';

const BrowseRepository = () => {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortPapers();
  }, [papers, searchTerm, selectedCategory, sortBy]);

  const fetchData = async () => {
    try {
      const [papersRes, categoriesRes] = await Promise.all([
        researchAPI.getPublishedResearch(),
        researchAPI.getCategories()
      ]);
      
      setPapers(papersRes.data.papers);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPapers = () => {
    let filtered = [...papers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(paper => paper.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_date) - new Date(a.published_date);
        case 'oldest':
          return new Date(a.published_date) - new Date(b.published_date);
        case 'most_viewed':
          return b.view_count - a.view_count;
        case 'most_downloaded':
          return b.download_count - a.download_count;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredPapers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleDownload = async (paper) => {
    try {
      // Open PDF in new tab
      window.open(paper.file_url, '_blank');
      
      // Optionally track download
      // await researchAPI.trackDownload(paper.id);
    } catch (error) {
      console.error('Download error:', error);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Research Repository</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and download published research papers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, abstract, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_viewed">Most Viewed</option>
                  <option value="most_downloaded">Most Downloaded</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredPapers.length}</span> of{' '}
            <span className="font-semibold">{papers.length}</span> research papers
          </p>
        </div>
      </div>

      {/* Research Cards Grid */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No research papers found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'No published research papers available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <div className="flex items-start justify-between">
                  <span className="inline-block px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {getCategoryName(paper.category)}
                  </span>
                  <div className="flex gap-2 text-white text-xs">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {paper.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download size={14} />
                      {paper.download_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {paper.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  {paper.abstract}
                </p>

                {/* Author and Date */}
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{paper.users?.full_name || 'Unknown Author'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Published {formatDate(paper.published_date)}</span>
                  </div>
                </div>

                {/* Keywords */}
                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {paper.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          <Tag size={12} />
                          {keyword}
                        </span>
                      ))}
                      {paper.keywords.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{paper.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownload(paper)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => window.open(paper.file_url, '_blank')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View PDF"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More (Optional - for pagination) */}
      {filteredPapers.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Viewing all {filteredPapers.length} research papers
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseRepository;