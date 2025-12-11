import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowLeftRight, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import Navigation from '../../components/navigation';

interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: string;
  type: 'LOWER' | 'UPPER';
  status: 'AVAILABLE' | 'BOOKED' | 'SELECTED';
  price: number;
}

type BusType = 'mini-van' | 'sleeping-bus' | 'regular-bus';

interface BusLayout {
  type: BusType;
  name: string;
  description: string;
  totalSeats: number;
  columns: string[];
  rows: number;
  hasUpperDeck: boolean;
  layout: 'compact' | 'double-decker' | 'standard';
}

const busLayouts: Record<BusType, BusLayout> = {
  'mini-van': {
    type: 'mini-van',
    name: 'Mini Van',
    description: '15 seats - Mini Van',
    totalSeats: 15,
    columns: ['A', 'B', 'C'],
    rows: 5,
    hasUpperDeck: false,
    layout: 'compact',
  },
  'sleeping-bus': {
    type: 'sleeping-bus',
    name: 'Sleeping Bus',
    description: '34 seats - Sleeping Bus',
    totalSeats: 34,
    columns: ['A', 'B', 'C', 'D'],
    rows: 9,
    hasUpperDeck: true,
    layout: 'double-decker',
  },
  'regular-bus': {
    type: 'regular-bus',
    name: 'Regular Bus',
    description: '45 seats - Regular Bus',
    totalSeats: 45,
    columns: ['A', 'B', 'C', 'D'],
    rows: 12,
    hasUpperDeck: false,
    layout: 'standard',
  },
};

export default function SeatSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<'LOWER' | 'UPPER'>('LOWER');

  const busId = searchParams.get('busId') || '';
  const busType = (searchParams.get('busType') as BusType) || 'regular-bus';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const currentLayout = busLayouts[busType];

  // Mock bus data
  const busData = {
    companyName: 'Perera Travels',
    busType: currentLayout.name,
    departureTime: '9:00 AM',
    arrivalTime: '9:45 AM',
    price: 200,
    currency: '$',
  };

  useEffect(() => {
    loadSeats();
  }, [busId, busType]);

  const loadSeats = () => {
    setLoading(true);
    const mockSeats: Seat[] = [];
    const layout = currentLayout;

    if (layout.type === 'mini-van') {
      // Mini Van: Irregular layout - 15 seats total
      // Row 1: 2 seats (1, 2)
      // Row 2: 3 seats (3, 4, 5)
      // Row 3: 2 seats (6, 7) [gap] 1 seat (8)
      // Row 4: 2 seats (9, 10) [gap] 1 seat (11)
      // Row 5: 4 seats (12, 13, 14, 15)
      
      const miniVanLayout = [
        { row: 1, seats: [{ col: 'C', num: 1 }, { col: 'D', num: 2 }] },
        { row: 2, seats: [{ col: 'A', num: 3 }, { col: 'B', num: 4 }, { col: 'C', num: 5 }] },
        { row: 3, seats: [{ col: 'A', num: 6 }, { col: 'B', num: 7 }, { col: 'D', num: 8 }] },
        { row: 4, seats: [{ col: 'A', num: 9 }, { col: 'B', num: 10 }, { col: 'D', num: 11 }] },
        { row: 5, seats: [{ col: 'A', num: 12 }, { col: 'B', num: 13 }, { col: 'C', num: 14 }, { col: 'D', num: 15 }] },
      ];

      miniVanLayout.forEach(rowData => {
        rowData.seats.forEach(seat => {
          const isBooked = Math.random() > 0.8;
          mockSeats.push({
            id: `${seat.num}`,
            seatNumber: `${seat.num}`,
            row: rowData.row,
            column: seat.col,
            type: 'LOWER',
            status: isBooked ? 'BOOKED' : 'AVAILABLE',
            price: 200,
          });
        });
      });
    } else if (layout.type === 'sleeping-bus') {
      // Sleeping Bus: Double-decker - 34 seats total (15 lower + 19 upper)
      // Layout: 2-1 with aisle (A B [aisle] C)
      // Lower: rows 1-5 (3 seats each) = 15 seats
      // Upper: rows 1-5 (3 seats each) + row 6 (3 seats) + row 7 (1 seat) = 19 seats

      // Lower deck (1-15) - 5 rows of 3 seats
      for (let row = 1; row <= 5; row++) {
        const columns = ['A', 'B', 'C'];
        columns.forEach(col => {
          const seatNum = (row - 1) * 3 + columns.indexOf(col) + 1;
          const isBooked = Math.random() > 0.7;
          mockSeats.push({
            id: `L${seatNum}`,
            seatNumber: `${seatNum}`,
            row,
            column: col,
            type: 'LOWER',
            status: isBooked ? 'BOOKED' : 'AVAILABLE',
            price: 200,
          });
        });
      }

      // Upper deck (16-30) - 5 rows of 3 seats
      for (let row = 1; row <= 5; row++) {
        const columns = ['A', 'B', 'C'];
        columns.forEach(col => {
          const seatNum = 15 + (row - 1) * 3 + columns.indexOf(col) + 1;
          const isBooked = Math.random() > 0.7;
          mockSeats.push({
            id: `${seatNum}`,
            seatNumber: `${seatNum}`,
            row,
            column: col,
            type: 'UPPER',
            status: isBooked ? 'BOOKED' : 'AVAILABLE',
            price: 200,
          });
        });
      }

      // Upper deck row 6 (31-34) - 4 seats: A=31, B=32, C=33, D=34
      ['A', 'B', 'C', 'D'].forEach((col, idx) => {
        const seatNum = 31 + idx;
        const isBooked = Math.random() > 0.7;
        mockSeats.push({
          id: `${seatNum}`,
          seatNumber: `${seatNum}`,
          row: 6,
          column: col,
          type: 'UPPER',
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          price: 200,
        });
      });
    } else if (layout.type === 'regular-bus') {
      // Regular Bus: 45 seats - 2-2 layout with aisle
      // Layout: A B [aisle] C D
      // 10 rows of 4 seats (40) + 1 back row with 5 seats = 45 seats

      for (let row = 1; row <= 10; row++) {
        const columns = ['A', 'B', 'C', 'D'];
        columns.forEach(col => {
          const seatNum = (row - 1) * 4 + columns.indexOf(col) + 1;
          const isBooked = Math.random() > 0.7;
          mockSeats.push({
            id: `${seatNum}`,
            seatNumber: `${seatNum}`,
            row,
            column: col,
            type: 'LOWER',
            status: isBooked ? 'BOOKED' : 'AVAILABLE',
            price: 200,
          });
        });
      }

      // Back row (row 11) - 5 seats (41, 42, 43, 44, 45)
      // Layout: A B [aisle-C] D E
      const backRowSeats = [
        { num: 41, col: 'A' },
        { num: 42, col: 'B' },
        { num: 43, col: 'C' }, // Middle aisle position
        { num: 44, col: 'D' },
        { num: 45, col: 'E' },
      ];

      backRowSeats.forEach(seat => {
        const isBooked = Math.random() > 0.7;
        mockSeats.push({
          id: `${seat.num}`,
          seatNumber: `${seat.num}`,
          row: 11,
          column: seat.col,
          type: 'LOWER',
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          price: 200,
        });
      });
    }

    setTimeout(() => {
      setSeats(mockSeats);
      setLoading(false);
    }, 500);
  };

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === 'BOOKED') return;

    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (seat.id === seatId) {
          const newStatus = seat.status === 'SELECTED' ? 'AVAILABLE' : 'SELECTED';
          
          if (newStatus === 'SELECTED') {
            setSelectedSeats([...selectedSeats, seatId]);
          } else {
            setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
          }
          
          return { ...seat, status: newStatus };
        }
        return seat;
      })
    );
  };

  const getTotalPrice = () => {
    return selectedSeats.length * busData.price;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${date.getDate()}th - ${months[date.getMonth()]} - ${date.getFullYear()} | ${days[date.getDay()]}`;
  };

  const handleBookSeats = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    
    navigate(`/bus/booking?busId=${busId}&seats=${selectedSeats.join(',')}&from=${from}&to=${to}&date=${date}`);
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return '#01005B';
      case 'SELECTED':
        return '#FF6B35';
      case 'AVAILABLE':
        return '#E5E7EB';
      default:
        return '#E5E7EB';
    }
  };

  const renderSeatGrid = (deckSeats: Seat[]) => {
    const layout = currentLayout;

    if (layout.type === 'mini-van') {
      // Mini Van: Custom irregular layout
      return (
        <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
          {/* Row 1: 2 seats in columns C, D */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            <div></div>
            <div></div>
            {deckSeats
              .filter(s => s.row === 1)
              .sort((a, b) => a.column.localeCompare(b.column))
              .map(seat => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  disabled={seat.status === 'BOOKED'}
                  className="w-14 h-14 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: getSeatColor(seat.status),
                    color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                  }}
                >
                  {seat.seatNumber}
                </button>
              ))}
          </div>

          {/* Row 2: 3 seats in columns A, B, C */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {deckSeats
              .filter(s => s.row === 2)
              .sort((a, b) => a.column.localeCompare(b.column))
              .map(seat => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  disabled={seat.status === 'BOOKED'}
                  className="w-14 h-14 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: getSeatColor(seat.status),
                    color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                  }}
                >
                  {seat.seatNumber}
                </button>
              ))}
            <div></div>
          </div>

          {/* Row 3: 2 seats (A, B) [gap] 1 seat (D) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {deckSeats
              .filter(s => s.row === 3)
              .sort((a, b) => a.column.localeCompare(b.column))
              .map((seat, idx) => (
                <>
                  {idx === 2 && <div key={`gap-3`}></div>}
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat.id, seat.status)}
                    disabled={seat.status === 'BOOKED'}
                    className="w-14 h-14 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: getSeatColor(seat.status),
                      color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                </>
              ))}
          </div>

          {/* Row 4: 2 seats (A, B) [gap] 1 seat (D) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {deckSeats
              .filter(s => s.row === 4)
              .sort((a, b) => a.column.localeCompare(b.column))
              .map((seat, idx) => (
                <>
                  {idx === 2 && <div key={`gap-4`}></div>}
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat.id, seat.status)}
                    disabled={seat.status === 'BOOKED'}
                    className="w-14 h-14 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: getSeatColor(seat.status),
                      color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                </>
              ))}
          </div>

          {/* Row 5: 4 seats (A, B, C, D) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {deckSeats
              .filter(s => s.row === 5)
              .sort((a, b) => a.column.localeCompare(b.column))
              .map(seat => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  disabled={seat.status === 'BOOKED'}
                  className="w-14 h-14 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: getSeatColor(seat.status),
                    color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                  }}
                >
                  {seat.seatNumber}
                </button>
              ))}
          </div>
        </div>
      );
    } else if (layout.type === 'sleeping-bus') {
      // Sleeping Bus: 2-1 layout with aisle (A B [aisle] C) for most rows
      const rows = [...new Set(deckSeats.map(s => s.row))].sort((a, b) => a - b);
      
      return (
        <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
          {rows.map(row => {
            const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => a.column.localeCompare(b.column));
            
            // Check if this is the last row with 4 seats (31, 32, 33, 34)
            if (rowSeats.length === 4) {
              return (
                <div key={row} className="grid grid-cols-4 gap-2 w-full">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      disabled={seat.status === 'BOOKED'}
                      className="w-12 h-12 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: getSeatColor(seat.status),
                        color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                      }}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}
                </div>
              );
            }
            
            // Normal rows with 3 seats (A B [aisle] C)
            return (
              <div key={row} className="grid grid-cols-4 gap-2 w-full">
                {rowSeats.map((seat, idx) => (
                  <>
                    {idx === 2 && <div key={`aisle-${row}`}></div>}
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      disabled={seat.status === 'BOOKED'}
                      className="w-12 h-12 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: getSeatColor(seat.status),
                        color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                      }}
                    >
                      {seat.seatNumber}
                    </button>
                  </>
                ))}
              </div>
            );
          })}
        </div>
      );
    } else if (layout.type === 'regular-bus') {
      // Regular Bus: 2-2 layout with aisle (A B [aisle] C D)
      const rows = [...new Set(deckSeats.map(s => s.row))].sort((a, b) => a - b);
      
      return (
        <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
          {rows.map(row => {
            const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => a.column.localeCompare(b.column));
            
            // Check if this is the last row with 5 seats (41, 42, 43, 44, 45)
            if (rowSeats.length === 5) {
              return (
                <div key={row} className="grid grid-cols-5 gap-2 w-full">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      disabled={seat.status === 'BOOKED'}
                      className="w-12 h-12 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: getSeatColor(seat.status),
                        color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                      }}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}
                </div>
              );
            }
            
            // Normal rows with 4 seats (A B [aisle] C D)
            return (
              <div key={row} className="grid grid-cols-5 gap-2 w-full">
                {rowSeats.map((seat, idx) => (
                  <>
                    {idx === 2 && <div key={`aisle-${row}`}></div>}
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      disabled={seat.status === 'BOOKED'}
                      className="w-12 h-12 rounded-lg font-medium text-xs transition-all hover:shadow-md disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: getSeatColor(seat.status),
                        color: seat.status === 'AVAILABLE' ? '#374151' : 'white',
                      }}
                    >
                      {seat.seatNumber}
                    </button>
                  </>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const lowerDeckSeats = seats.filter((s) => s.type === 'LOWER');
  const upperDeckSeats = seats.filter((s) => s.type === 'UPPER');
  const displaySeats = activeDeck === 'LOWER' ? lowerDeckSeats : upperDeckSeats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Bus Booking" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01005B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading seats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Bus Booking" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium">SS</span>
            </div>
            <div>
              <p className="font-medium">Hello Saduni Silva!</p>
              <p className="text-sm text-gray-600">Where you want go</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Select Your Seats</h2>

              {/* Route Info */}
              <div className="bg-[#01005B] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-6 text-white">
                  <div className="text-center">
                    <p className="text-xl font-bold">{from}</p>
                  </div>
                  <ArrowLeftRight size={20} />
                  <div className="text-center">
                    <p className="text-xl font-bold">{to}</p>
                  </div>
                </div>
                <p className="text-center text-white/80 mt-2 text-sm">{formatDate(date)}</p>
              </div>

              {/* Company Info */}
              <div className="mb-6">
                <p className="font-bold text-lg">{busData.companyName}</p>
                <p className="text-sm text-gray-600">{currentLayout.description}</p>
                <p className="text-sm text-gray-600 mt-1">Total Seats: {currentLayout.totalSeats}</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mb-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#01005B' }}></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FF6B35' }}></div>
                  <span className="text-sm">Your Seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-200"></div>
                  <span className="text-sm">Available</span>
                </div>
              </div>

              {/* Deck Tabs for Double-Decker */}
              {currentLayout.hasUpperDeck && (
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setActiveDeck('LOWER')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      activeDeck === 'LOWER'
                        ? 'bg-[#01005B] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Lower Deck
                  </button>
                  <button
                    onClick={() => setActiveDeck('UPPER')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      activeDeck === 'UPPER'
                        ? 'bg-[#01005B] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Upper Deck
                  </button>
                </div>
              )}

              {/* Seat Grid */}
              <div className="mb-6">
                <h3 className="font-bold mb-4">
                  {currentLayout.hasUpperDeck ? `${activeDeck === 'LOWER' ? 'Lower' : 'Upper'} Deck` : 'Seating'}
                </h3>
                {renderSeatGrid(displaySeats)}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Selected Seats</h3>
              
              {selectedSeats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No seats selected</p>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedSeats.map(id => {
                          const seat = seats.find(s => s.id === id);
                          return seat?.seatNumber;
                        }).join(', ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Count: {selectedSeats.length}</p>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Fare</span>
                      <span className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
                        {busData.currency} {getTotalPrice()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookSeats}
                    className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#01005B' }}
                  >
                    Book Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}