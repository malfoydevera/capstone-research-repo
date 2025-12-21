import { User, Bell, Save } from 'lucide-react';

const StaffSettings = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
               S
             </div>
             <div>
               <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">Change Photo</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 border p-2" defaultValue="Staff Member" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 block w-full rounded-md border-gray-300 border p-2 bg-gray-50" defaultValue="staff@example.com" disabled />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio / Department</label>
            <textarea className="mt-1 block w-full rounded-md border-gray-300 border p-2" rows="3"></textarea>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Save Profile</button>
        </div>
      </div>
    </div>
  );
};

export default StaffSettings;