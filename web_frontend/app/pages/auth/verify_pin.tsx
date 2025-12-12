import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { verifyPin, forgotPassword } from '~/api/auth';

// Mock mode for testing (should match forget_password.tsx)
const USE_MOCK_DATA = true;

export default function VerifyPinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/forget-password');
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newPin = [...pin];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    const nextEmpty = newPin.findIndex(val => !val);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const completePin = pin.join('');
    if (completePin.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        await verifyPin({ email, pin: completePin });
      }

      navigate('/reset-password', { state: { email, pin: completePin } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PIN. Please try again.');
      console.error('PIN verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    try {
      setResending(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        await forgotPassword({ email });
      }

      // Clear PIN fields
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Show success message (optional)
      setError('PIN resent successfully! Check your email.');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend PIN. Please try again.');
      console.error('Resend PIN error:', err);
    } finally {
      setResending(false);
    }
  };

  const isPinComplete = pin.every(digit => digit !== '');

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Verify Email</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Please check your email and enter the 6-digit verification code below
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 overflow-hidden flex-1">
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 overflow-hidden">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs text-red-800 break-words overflow-wrap-anywhere">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* PIN Input Fields */}
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent transition-all"
                  disabled={loading}
                />
              ))}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isPinComplete || loading}
              className="w-full bg-[#01005B] text-white py-2 sm:py-2.5 rounded-lg text-sm font-semibold hover:bg-[#000047] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </form>

          {/* Resend PIN */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs text-gray-600">
              Don't get the PIN?{' '}
              <button 
                onClick={handleResendPin}
                disabled={resending}
                className="font-semibold text-[#01005B] hover:underline transition-colors disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Send again'}
              </button>
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-3 sm:mt-4 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#01005B] hover:underline transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
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
