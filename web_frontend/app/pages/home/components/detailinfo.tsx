import { Clock, Cloudy, DollarSign, Info } from 'lucide-react';

interface DetailInfoProps {
  openingHours: string;
  entryFee: string;
  weather: string;
  description: string;
  highlights: string[];
}

export default function DetailInfo({ openingHours, entryFee, weather,description, highlights }: DetailInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 mt-1" style={{ color: '#01005B' }} />
          <div>
            <p className="text-sm text-gray-600">Opening Hours</p>
            <p className="font-semibold text-gray-900">{openingHours}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <DollarSign className="w-5 h-5 mt-1" style={{ color: '#01005B' }} />
          <div>
            <p className="text-sm text-gray-600">Entry Fee</p>
            <p className="font-semibold text-gray-900">{entryFee}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Cloudy className="w-5 h-5 mt-1" style={{ color: '#01005B' }} />
          <div>
            <p className="text-sm text-gray-600">Weather</p>
            <p className="font-semibold text-gray-900">{weather}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <Info className="w-5 h-5 mr-2" style={{ color: '#01005B' }} />
          About
        </h3>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      {/* Highlights */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Highlights</h3>
        <ul className="space-y-2">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2" style={{ color: '#01005B' }}>✓</span>
              <span className="text-gray-700">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}