import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { resetPassword } from '~/api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const pin = location.state?.pin || '';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !pin) {
      navigate('/forget-password');
    }
  }, [email, pin, navigate]);

  const validateForm = () => {
    if (!password) {
      setError('Please enter a password');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await resetPassword({
        email,
        pin,
        password,
        password_confirmation: confirmPassword,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Reset Password</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 lg:mb-6">
            Enter your new password and confirm it to reset your account password
          </p>

          {!success ? (
            <>
              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Password Input */}
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="New Password"
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                    required
                    disabled={loading}
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

                {/* Confirm Password Input */}
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Confirm Password"
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                    required
                    disabled={loading}
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
                  disabled={loading}
                  className="w-full py-3 sm:py-4 bg-[#01005B] text-white text-sm sm:text-base font-bold rounded-full hover:bg-[#000047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>

              {/* Back to Login */}
              <p className="text-center mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#01005B] hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-2">Password Reset Successfully!</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your password has been reset. You can now login with your new password.
              </p>

              <p className="text-xs text-gray-500">Redirecting to login...</p>
            </div>
          )}
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
