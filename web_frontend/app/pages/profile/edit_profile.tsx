import { useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';

export default function EditProfilePage() {
  const navigate = useNavigate();
  
  // Mock user data
  const [formData, setFormData] = useState({
    firstName: 'Saduni',
    lastName: 'Silva',
    email: 'saduni.silva@example.com',
    phone: '+94 77 123 4567',
    address: 'Colombo, Sri Lanka',
    dateOfBirth: '1995-05-15',
    gender: 'female',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      navigate('/profile');
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

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
          <h1 className="text-4xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-lg text-gray-600 mt-2">Update your personal information</p>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#01005B] flex items-center justify-center text-white text-3xl font-bold">
                SS
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Camera size={16} className="text-gray-700" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-3">Upload a new profile picture</p>
              <button className="px-4 py-2 text-sm font-semibold text-[#01005B] border-2 border-[#01005B] rounded-lg hover:bg-[#01005B] hover:text-white transition-colors">
                Change Photo
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-4 text-base font-bold border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-4 text-base font-bold bg-[#01005B] text-white rounded-xl hover:bg-[#000047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}