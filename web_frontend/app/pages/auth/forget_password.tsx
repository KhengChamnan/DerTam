import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { forgotPassword } from '~/api/auth';

// Mock mode for testing (set to false for production)
const USE_MOCK_DATA = false;

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Mock API call for testing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Simulate success
        setSuccess(true);
      } else {
        // Real API call
        await forgotPassword({ email });
        setSuccess(true);
      }

      setTimeout(() => {
        navigate('/verify-pin', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset PIN. Please try again.');
      console.error('Password reset error:', err);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Enter your email to receive a reset PIN</p>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all truncate"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#01005B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#000047] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset PIN'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#01005B] hover:underline transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-600 mb-1">
                We've sent a 6-digit PIN to
              </p>
              <p className="text-sm font-semibold text-[#01005B] mb-4 break-words">
                {email}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <p className="text-xs text-gray-700 mb-2">Next steps:</p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>Check your email for the PIN</li>
                  <li>Enter the PIN on the next page</li>
                  <li>Create your new password</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500">Redirecting...</p>
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
