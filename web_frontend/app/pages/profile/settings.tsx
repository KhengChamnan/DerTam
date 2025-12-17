import { useState } from 'react';
import { ArrowLeft, Bell, Lock, CreditCard, Globe, Moon, HelpCircle, Shield, Mail, Smartphone, FileText, ChevronRight } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Profile" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-base font-medium"
          >
            <ArrowLeft size={22} />
            Back to Profile
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-lg text-gray-600 mt-2">Manage your account preferences</p>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          </div>
          
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Shield size={22} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Personal Information</p>
                <p className="text-sm text-gray-500">Update your profile details</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/profile/change-password')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Lock size={22} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            // onClick={() => navigate('/profile/payment-methods')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CreditCard size={22} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Payment Methods</p>
                <p className="text-sm text-gray-500">Manage your payment options</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Bell size={22} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">All Notifications</p>
                  <p className="text-sm text-gray-500">Enable or disable all notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#01005B]"></div>
              </label>
            </div>
          </div>

          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Mail size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#01005B]"></div>
              </label>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Smartphone size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#01005B]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>

          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Moon size={22} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#01005B]"></div>
              </label>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile/language')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Globe size={22} className="text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Language</p>
                <p className="text-sm text-gray-500">{language}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Support</h2>
          </div>

          <button
            onClick={() => navigate('/help')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <HelpCircle size={22} className="text-teal-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Help & Support</p>
                <p className="text-sm text-gray-500">Get help with your account</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/privacy')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <Shield size={22} className="text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Privacy Policy</p>
                <p className="text-sm text-gray-500">Read our privacy policy</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/terms')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <FileText size={22} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Terms & Conditions</p>
                <p className="text-sm text-gray-500">Read our terms of service</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}