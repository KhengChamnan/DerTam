import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getCurrentUser } from '../../api/auth';
import { updateProfile, updateProfileWithFormData } from '../../api/profile';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  phone_number: '',
  age: '',
  gender: '',
  image: null as File | null,
});

  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('token');
      if (authStatus !== 'true' || !token) {
        navigate('/login');
        return;
      }
      try {
        const user = await getCurrentUser();
        const nameParts = user.name ? user.name.split(' ') : [''];
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
          username: user.username || '',
          phone_number: user.phone_number || '',
          age: user.age ? String(user.age) : '',
          gender: user.gender || '',
          image: null,
        });
        setAvatar(user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '');
        setCurrentImageUrl(user.profile_image_url || null);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      if (!fullName) {
        alert('Please enter your name');
        setIsSaving(false);
        return;
      }

      const payload = new FormData();
      payload.append('name', fullName);
      if (formData.email) payload.append('email', formData.email);
      if (formData.username) payload.append('username', formData.username);
      if (formData.phone_number) payload.append('phone_number', formData.phone_number);
      if (formData.age) payload.append('age', formData.age);
      if (formData.gender) payload.append('gender', formData.gender);
      if (formData.image) payload.append('profile_image', formData.image); 

      await updateProfileWithFormData(payload);

      setIsSaving(false);
      navigate('/profile');
    } catch (err) {
      setIsSaving(false);
      alert((err as Error).message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation activeNav="Profile" /> */}

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
              <div className="w-24 h-24 rounded-full bg-[#01005B] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Profile Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Current Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  avatar
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} className="text-gray-700" />
              </button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                name="image"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files ? e.target.files[0] : null;
                  setFormData(prev => ({
                    ...prev,
                    image: file,
                  }));
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-3">Upload a new profile picture</p>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-[#01005B] border-2 border-[#01005B] rounded-lg hover:bg-[#01005B] hover:text-white transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
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
                 
                  />
                </div>
              </div>

               {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
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

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                  
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
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
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