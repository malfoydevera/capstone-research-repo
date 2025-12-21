import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of repository performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Downloads</h3>
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="text-blue-600" size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">1,234</p>
          <p className="text-green-600 text-sm flex items-center mt-2"><TrendingUp size={16} className="mr-1"/> +12% this month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
            <div className="p-2 bg-purple-100 rounded-lg"><Users className="text-purple-600" size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">856</p>
          <p className="text-green-600 text-sm flex items-center mt-2"><TrendingUp size={16} className="mr-1"/> +5% this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Submission Rate</h3>
            <div className="p-2 bg-orange-100 rounded-lg"><BarChart3 className="text-orange-600" size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">24/week</p>
          <p className="text-gray-500 text-sm mt-2">Consistent with last week</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow h-96 flex items-center justify-center border-2 border-dashed border-gray-200">
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>Detailed Charts & Graphs Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;