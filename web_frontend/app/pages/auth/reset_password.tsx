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
    <div className="min-h-screen max-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-3 sm:py-4 overflow-hidden w-full">
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Enter your new password and confirm it to reset your account password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 overflow-hidden flex-1">
          {!success ? (
            <>
              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 overflow-hidden">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs text-red-800 break-words overflow-wrap-anywhere">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter new password"
                      className="w-full pl-8 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                      required
                      disabled={loading}
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

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Confirm new password"
                      className="w-full pl-8 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                      required
                      disabled={loading}
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
                  disabled={loading}
                  className="w-full bg-[#01005B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#000047] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">
                  Remember your password?{' '}
                  <Link 
                    to="/login" 
                    className="font-semibold text-[#01005B] hover:underline transition-colors"
                  >
                    Go Back
                  </Link>
                </p>
              </div>
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
