import React from 'react';
import { X } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose, feature = 'booking' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <img
            src="/images/dertam_logo.png"
            alt="Dertam Logo"
            className="w-32 mx-auto mb-3"
          />
          
          <h2 className="text-xl font-bold text-[#01005B] mb-2">
            Install Dertam App
          </h2>
          
          <p className="text-gray-600 text-sm mb-6">
            To complete your {feature}, please install the Dertam mobile app.
          </p>

          <div className="space-y-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.dertam.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#01005B] text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-[#000442] transition-colors"
            >
              Download on Google Play
            </a>

            <a
              href="https://apps.apple.com/app/dertam"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gray-800 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Download on App Store
            </a>

            <button
              onClick={onClose}
              className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;