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
    <div className="min-h-screen max-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 py-3 sm:py-4 overflow-hidden w-full">
      <div className="w-full max-w-[95vw] sm:max-w-md overflow-hidden max-h-[98vh] flex flex-col">
        {/* Logo */}
        <div className="text-center mb-3 sm:mb-4 shrink-0">
          <Link to="/">
            <img 
              src="/images/logo.png" 
              alt="DerTam Logo" 
              className="h-10 sm:h-12 mx-auto mb-2 cursor-pointer"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Start your adventure with us</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 overflow-hidden flex-1">
          {error && (
            <div className="mb-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 overflow-hidden">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs text-red-800 break-words overflow-wrap-anywhere">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-2.5 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 overflow-hidden">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs text-green-800 break-words overflow-wrap-anywhere">Account created successfully!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 overflow-hidden">
            {/* Full Name */}
            <div className="overflow-hidden">
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative overflow-hidden">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="overflow-hidden">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative overflow-hidden">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                  required
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div className="overflow-hidden">
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative overflow-hidden">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                />
              </div>
            </div>

            {/* Password */}
            <div className="overflow-hidden">
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative overflow-hidden">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min. 8 characters)"
                  className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="overflow-hidden">
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative overflow-hidden">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#01005B] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#000047] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-4 h-4 shrink-0"
            />
            <span className="truncate">Sign up with Google</span>
          </button>

          {/* Sign In Link */}
          <p className="text-center mt-2.5 text-xs text-gray-600 break-words">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#01005B] hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-2 shrink-0">
          <Link 
            to="/" 
            className="text-xs text-gray-600 hover:text-[#01005B] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}