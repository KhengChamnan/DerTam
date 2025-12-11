import { useState } from 'react';
import { Calendar, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';

export default function ProfilePage() {
  const navigate = useNavigate();

  // Mock user data
  const userData = {
    name: 'Saduni Silva',
    email: 'saduni.silva@example.com',
    phone: '+94 77 123 4567',
    avatar: 'SS',
    memberSince: 'January 2024',
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Profile" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#01005B] flex items-center justify-center text-white text-2xl font-bold">
              {userData.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-sm text-gray-500">Member since {userData.memberSince}</p>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-2xl shadow-lg">
          {/* My Bookings */}
          <button
            onClick={() => navigate('/profile/my_bookings')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">My Bookings</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          {/* Favorites */}
          <button
            onClick={() => navigate('/profile/favorites')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart size={20} className="text-red-600" />
              </div>
              <span className="font-medium text-gray-900">Favorites</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/profile/settings')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings size={20} className="text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Settings</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-white rounded-2xl shadow-lg p-5 flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}