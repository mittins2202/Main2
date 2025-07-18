import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, AlertCircle, CheckCircle, Bell, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: true
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleProfileSave = async () => {
    setSaveStatus('saving');
    try {
      await updateProfile(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleNotificationSave = () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 rounded-r-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Save Status */}
              {saveStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center ${
                    saveStatus === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : saveStatus === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  {saveStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : saveStatus === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    saveStatus === 'success'
                      ? 'text-green-700'
                      : saveStatus === 'error'
                      ? 'text-red-700'
                      : 'text-blue-700'
                  }`}>
                    {saveStatus === 'success'
                      ? 'Settings saved successfully!'
                      : saveStatus === 'error'
                      ? 'Failed to save settings. Please try again.'
                      : 'Saving settings...'}
                  </span>
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                  
                  {/* Profile Photo Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Upload a photo for your profile.
                        </p>
                        <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                          <input type="file" className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleProfileSave}
                      disabled={isLoading}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 rounded-xl">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {key === 'emailUpdates' ? 'Email Updates' : 'Marketing Emails'}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {key === 'emailUpdates' ? 'Receive updates about your business recommendations' : 'Receive promotional emails and newsletters'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}

                    <button
                      onClick={handleNotificationSave}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}


            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;