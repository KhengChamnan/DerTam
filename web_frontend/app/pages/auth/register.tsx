import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { register, type RegisterData } from '~/api/auth';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const registerData: RegisterData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      };

      const response = await register(registerData);
      
      // Store authentication state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Dispatch custom event to notify Navigation component
      window.dispatchEvent(new Event('authChange'));

      setSuccess(true);

      // Navigate to home page after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In
    console.log('Google Sign In clicked');
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 lg:mb-6">Start your adventure with us</p>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs sm:text-sm text-green-600">Account created successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            {/* Full Name */}
            <div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min. 8 characters)"
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-[#01005B]"
              >
                {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-[#01005B]"
              >
                {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 sm:py-4 bg-[#01005B] text-white text-sm sm:text-base font-bold rounded-full hover:bg-[#000047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#01005B] hover:underline"
            >
              Sign In
            </Link>
          </p>

          {/* Divider */}
          <div className="relative my-3 sm:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-gray-100 text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || success}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-white border-0 rounded-full text-sm sm:text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-white items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/dertam.png" 
            alt="Travel destinations" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}