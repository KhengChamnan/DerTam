import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding/Image */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/dertam.png" 
            alt="Travel destinations" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center px-8 py-6">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Sign Up</h1>

          {errors.terms && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.terms}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className={`w-full px-5 py-2.5 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-gray-900 placeholder-gray-400 ${
                    errors.firstName ? 'ring-2 ring-red-500' : ''
                  }`}
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-0.5 ml-4">{errors.firstName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className={`w-full px-5 py-2.5 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-gray-900 placeholder-gray-400 ${
                    errors.lastName ? 'ring-2 ring-red-500' : ''
                  }`}
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-0.5 ml-4">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={`w-full px-5 py-2.5 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-gray-900 placeholder-gray-400 ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-0.5 ml-4">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className={`w-full px-5 py-2.5 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-gray-900 placeholder-gray-400 ${
                  errors.phone ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-0.5 ml-4">{errors.phone}</p>}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`w-full px-5 py-2.5 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-gray-900 placeholder-gray-400 ${
                  errors.password ? 'ring-2 ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#01005B]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="text-xs text-red-500 mt-0.5 ml-4">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className={`w-full px-5 py-2.5 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-gray-900 placeholder-gray-400 ${
                  errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#01005B]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-0.5 ml-4">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                  className="w-4 h-4 mt-0.5 text-[#01005B] border-gray-300 rounded focus:ring-[#01005B]"
                />
                <span className="text-xs text-gray-700">
                  I agree to the{' '}
                  <button type="button" className="font-semibold text-[#01005B] hover:underline">
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button type="button" className="font-semibold text-[#01005B] hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#01005B] text-white font-bold rounded-full hover:bg-[#000047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-4 text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-[#01005B] hover:underline"
            >
              Log In
            </button>
          </p>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-100 text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button className="w-full py-3 px-6 bg-white border-0 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
            <img src="/images/google_logo.png" alt="Google Logo" className="w-7 h-7" />
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
}