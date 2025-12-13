import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { verifyPin, forgotPassword } from '~/api/auth';

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

      console.log('Verifying PIN:', { email, pin: completePin });
      
      const result = await verifyPin({ email, pin: completePin });
      
      console.log('PIN verification successful:', result);

      // PIN verified successfully, navigate to reset password
      navigate('/reset-password', { state: { email, pin: completePin } });
    } catch (err) {
      console.error('PIN verification failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid PIN. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    try {
      setResending(true);
      setError(null);

      console.log('Resending PIN to:', email);
      
      await forgotPassword({ email });

      console.log('PIN resent successfully');

      // Clear PIN fields
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Show success message
      setError('PIN resent successfully! Check your email.');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Resend PIN failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend PIN. Please try again.';
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const isPinComplete = pin.every(digit => digit !== '');

  return (
    <div className="min-h-screen max-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Verify Email</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 lg:mb-6">
            Please check your email and enter the 6-digit verification code below
          </p>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
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
              className="w-full py-3 sm:py-4 bg-[#01005B] text-white text-sm sm:text-base font-bold rounded-full hover:bg-[#000047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </form>

          {/* Resend PIN */}
          <p className="text-center mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
            Don't get the PIN?{' '}
            <button 
              onClick={handleResendPin}
              disabled={resending}
              className="font-semibold text-[#01005B] hover:underline transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Send again'}
            </button>
          </p>

          {/* Back to Login */}
          <p className="text-center mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#01005B] hover:underline"
            >
              Sign In
            </Link>
          </p>
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
