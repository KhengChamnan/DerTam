import { Users, Bed, Maximize } from "lucide-react";
import { useNavigate, useParams } from "react-router";

interface Room {
  id: number;
  type: string;
  price: number;
  capacity: number;
  beds: string;
  size: string;
  image: string;
  amenities: string[];
}

interface HotelRoomCardProps {
  room: Room;
}

export default function HotelRoomCard({ room }: HotelRoomCardProps) {
  const navigate = useNavigate();
  const { id: hotelId } = useParams();

  const handleCardClick = () => {
    navigate(`/hotel/${hotelId}/room/${room.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      style={{ transform: 'translateY(0)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Room Image */}
        <div className="md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={room.image}
            alt={room.type}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Room Details */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#01005B] transition-colors">{room.type}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" style={{ color: '#01005B' }} />
                  <span>{room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" style={{ color: '#01005B' }} />
                  <span>{room.beds}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4" style={{ color: '#01005B' }} />
                  <span>{room.size}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-2xl font-bold" style={{ color: '#01005B' }}>${room.price}</span>
                <span className="text-gray-600 text-sm">/ night</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)', color: '#01005B' }}
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)', color: '#01005B' }}
                >
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Book Button */}
          {/* <button 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            style={{ backgroundColor: '#01005B' }}
            className="w-full md:w-auto px-6 py-2.5 text-white rounded-lg font-semibold transition-all"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000047';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#01005B';
            }}
          >
            Select Room
          </button> */}
        </div>
      </div>
    </div>
  );
}
