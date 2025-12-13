import { useState, useEffect } from 'react';
import { Calendar, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';
import { getCurrentUser, logout as logoutApi } from '../../api/auth';
import InstallAppModal from '../../components/install_app_modal'; 

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: '',
    phone: '',
    memberSince: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is authenticated
      const authStatus = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('token');

      if (authStatus !== 'true' || !token) {
        // Redirect to login if not authenticated
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch fresh user data from API
        const user = await getCurrentUser();
        
        setUserData({
          name: user.name,
          email: user.email,
          phone: user.phone_number || '',
          avatar: user.profile_image_url // ⬅️ USE profile_image_url
            ? user.profile_image_url
            : user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          memberSince: user.created_at 
            ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently',
        });

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error('Failed to fetch user data');
        setError('Failed to load profile data');
        
        // If token is invalid, redirect to login
        if (err instanceof Error && err.message.includes('authentication')) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await logoutApi();
    } catch (err) {
      console.error('Logout failed');
    } finally {
      // Always redirect to home after logout
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Profile" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B]"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && (
          <>
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#01005B] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {userData.avatar && userData.avatar.startsWith('http') ? (
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    userData.avatar
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                  <p className="text-gray-600">{userData.email}</p>
                  {userData.phone && <p className="text-sm text-gray-500">{userData.phone}</p>}
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
              // onClick={() => navigate('//profile/my-bookings')}
                onClick={() => setShowInstallModal(true)}
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

            {/* Install App Modal */}
            <InstallAppModal
              isOpen={showInstallModal}
              onClose={() => setShowInstallModal(false)}
              feature="booking"
            />
          </>
        )}
      </div>
    </div>
  );
}