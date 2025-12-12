import { Clock, DollarSign, Star } from "lucide-react";

interface DetailInfoProps {
  description: string;
  openingHours?: string | Record<string, string>;
  entryFee?: {
    local: number;
    foreign: number;
  };
  highlights?: string[];
}

export default function DetailInfo({
  description,
  openingHours,
  entryFee,
  highlights,
}: DetailInfoProps) {
  // Format opening hours for display
  const formatOpeningHours = () => {
    if (!openingHours) return 'Not available';
    
    if (typeof openingHours === 'string') {
      return openingHours;
    }
    
    // If it's an object like {mon: "9:00-17:00", tue: "9:00-17:00"}
    if (typeof openingHours === 'object') {
      const days = Object.entries(openingHours);
      if (days.length === 0) return 'Not available';
      
      return (
        <div className="space-y-1">
          {days.map(([day, hours]) => (
            <div key={day} className="flex justify-between">
              <span className="capitalize font-medium">{day}:</span>
              <span>{hours}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return 'Not available';
  };

  const openingHoursDisplay = formatOpeningHours();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">About This Place</h2>
      
      <p className="text-gray-700 leading-relaxed mb-6">
        {description || 'No description available.'}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opening Hours */}
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-[#01005B] flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Opening Hours</h3>
            <div className="text-gray-600 text-sm">
              {openingHoursDisplay}
            </div>
          </div>
        </div>

        {/* Entry Fee */}
        {entryFee && (
          <div className="flex gap-3">
            <DollarSign className="w-5 h-5 text-[#01005B] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Entry Fee</h3>
              <div className="text-gray-600 text-sm space-y-1">
                {entryFee.local === 0 && entryFee.foreign === 0 ? (
                  <p>Free Entry</p>
                ) : (
                  <>
                    <p>Local: ${entryFee.local.toFixed(2)}</p>
                    <p>Foreign: ${entryFee.foreign.toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <Star className="w-5 h-5 text-[#01005B] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Highlights</h3>
              <ul className="space-y-2">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-[#01005B] mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}