import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { forgotPassword } from '~/api/auth';

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

      // Step 1: Send PIN to email via API
      await forgotPassword({ email });
      setSuccess(true);

      // Step 2: Navigate to verify PIN page with email
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
    <div className="min-h-screen max-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Forgot Password</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 lg:mb-6">Enter your email to receive a reset PIN</p>

          {!success ? (
            <>
              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Email"
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01005B] text-sm sm:text-base text-gray-900 placeholder-gray-400"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 bg-[#01005B] text-white text-sm sm:text-base font-bold rounded-full hover:bg-[#000047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset PIN'}
                </button>
              </form>

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
