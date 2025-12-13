import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowLeftRight, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import InstallAppModal from '../../components/install_app_modal';
import { getBusById, getBusSeats } from '../../api/bus';

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
  const [showInstallModal, setShowInstallModal] = useState(false);

  const busId = searchParams.get('busId') || '';
  const busTypeParam = searchParams.get('busType') || 'regular-bus';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const company = searchParams.get('company') || 'Bus Company';
  const departureTime = searchParams.get('departureTime') || '00:00';
  const priceParam = searchParams.get('price') || '0';

  // Map API bus type to layout bus type
  const mapBusType = (type: string): BusType => {
    console.log('Mapping bus type:', type);
    switch (type.toLowerCase()) {
      case 'mini-van':
        return 'mini-van';
      case 'sleeping-bus':
        return 'sleeping-bus';
      case 'regular':
      case 'regular-bus':
      default:
        return 'regular-bus';
    }
  };

  const busType = mapBusType(busTypeParam);
  const currentLayout = busLayouts[busType];

  // Safety check - redirect if layout not found
  if (!currentLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
      
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-red-500 text-lg mb-4">Invalid bus type: {busTypeParam}</p>
            <p className="text-gray-600 mb-6">The bus type is not recognized. Please go back and try again.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-[#01005B] text-white rounded-lg hover:bg-[#000442] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use real bus data from URL params
  const busData = {
    companyName: company,
    busType: currentLayout.name,
    departureTime: departureTime,
    arrivalTime: '',
    price: parseFloat(priceParam),
    currency: '$',
  };

  useEffect(() => {
    if (busId && date) {
      loadSeats();
    }
  }, [busId, date]);

  const loadSeats = async () => {
    try {
      setLoading(true);
      
      console.log('Loading seats for busId:', busId, 'date:', date);
      
      const apiSeats = await getBusSeats(busId, date);
      
      console.log('Fetched API seats:', apiSeats);

      if (!apiSeats || apiSeats.length === 0) {
        console.warn('No seats returned from API, generating mock data');
        generateMockSeats();
        return;
      }

      // Transform API seats to match component format
      const transformedSeats: Seat[] = apiSeats.map((apiSeat) => {
        const seatNo = apiSeat.number.toString(); // "A1", "B2", "D5", etc.
        const column = seatNo.charAt(0); // "A", "B", "C", "D", "E"
        const row = parseInt(seatNo.substring(1)); // 1, 2, 3, 4, 5, 6
        
        const type: 'LOWER' | 'UPPER' = apiSeat.deck === 'upper' ? 'UPPER' : 'LOWER';

        return {
          id: apiSeat.id,
          seatNumber: seatNo, // ✅ Use seat_no directly: "A1", "B2", "D5"
          row,
          column,
          type,
          status: apiSeat.status.toUpperCase() as 'AVAILABLE' | 'BOOKED' | 'SELECTED',
          price: apiSeat.price,
        };
      });

      console.log('Transformed seats for display:', transformedSeats);
      setSeats(transformedSeats);
    } catch (error) {
      console.error('Error loading seats:', error);
      console.log('Generating mock seats as fallback');
      generateMockSeats();
    } finally {
      setLoading(false);
    }
  };

  const generateMockSeats = () => {
    console.log('Generating mock seats for bus type:', currentLayout.type);
    const mockSeats: Seat[] = [];
    let seatNumber = 1;
    const basePrice = parseFloat(priceParam) || 100;

    if (currentLayout.type === 'mini-van') {
      // Mini Van: 15 seats
      // Row 1: C, D (seats 1, 2)
      mockSeats.push(
        { id: '1', seatNumber: '1', row: 1, column: 'C', type: 'LOWER', status: 'AVAILABLE', price: basePrice },
        { id: '2', seatNumber: '2', row: 1, column: 'D', type: 'LOWER', status: 'BOOKED', price: basePrice }
      );
      seatNumber = 3;

      // Row 2: A, B, C (seats 3, 4, 5)
      for (let col of ['A', 'B', 'C']) {
        mockSeats.push({
          id: seatNumber.toString(),
          seatNumber: seatNumber.toString(),
          row: 2,
          column: col,
          type: 'LOWER',
          status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
          price: basePrice,
        });
        seatNumber++;
      }

      // Row 3 & 4: A, B, D (seats 6-11)
      for (let row = 3; row <= 4; row++) {
        for (let col of ['A', 'B', 'D']) {
          mockSeats.push({
            id: seatNumber.toString(),
            seatNumber: seatNumber.toString(),
            row,
            column: col,
            type: 'LOWER',
            status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
            price: basePrice,
          });
          seatNumber++;
        }
      }

      // Row 5: A, B, C, D (seats 12-15)
      for (let col of ['A', 'B', 'C', 'D']) {
        mockSeats.push({
          id: seatNumber.toString(),
          seatNumber: seatNumber.toString(),
          row: 5,
          column: col,
          type: 'LOWER',
          status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
          price: basePrice,
        });
        seatNumber++;
      }
    } else if (currentLayout.type === 'sleeping-bus') {
      // Lower deck: 15 seats (rows 1-5, 3 per row)
      for (let row = 1; row <= 5; row++) {
        for (let col of ['A', 'B', 'C']) {
          mockSeats.push({
            id: seatNumber.toString(),
            seatNumber: seatNumber.toString(),
            row,
            column: col,
            type: 'LOWER',
            status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
            price: basePrice,
          });
          seatNumber++;
        }
      }

      // Upper deck: 19 seats (rows 1-4: 3 per row, row 5: 4 seats)
      for (let row = 1; row <= 4; row++) {
        for (let col of ['A', 'B', 'C']) {
          mockSeats.push({
            id: seatNumber.toString(),
            seatNumber: seatNumber.toString(),
            row,
            column: col,
            type: 'UPPER',
            status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
            price: basePrice,
          });
          seatNumber++;
        }
      }
      // Upper deck last row: 4 seats
      for (let col of ['A', 'B', 'C', 'D']) {
        mockSeats.push({
          id: seatNumber.toString(),
          seatNumber: seatNumber.toString(),
          row: 5,
          column: col,
          type: 'UPPER',
          status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
          price: basePrice,
        });
        seatNumber++;
      }
    } else {
      // Regular bus: 45 seats (rows 1-10: 4 per row, row 11: 5 seats)
      for (let row = 1; row <= 10; row++) {
        for (let col of ['A', 'B', 'C', 'D']) {
          mockSeats.push({
            id: seatNumber.toString(),
            seatNumber: seatNumber.toString(),
            row,
            column: col,
            type: 'LOWER',
            status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
            price: basePrice,
          });
          seatNumber++;
        }
      }
      // Back row: 5 seats
      for (let col of ['A', 'B', 'C', 'D', 'E']) {
        mockSeats.push({
          id: seatNumber.toString(),
          seatNumber: seatNumber.toString(),
          row: 11,
          column: col,
          type: 'LOWER',
          status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
          price: basePrice,
        });
        seatNumber++;
      }
    }

    console.log('Generated mock seats:', mockSeats.length);
    setSeats(mockSeats);
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
    
    // Show install app modal instead of navigating
    setShowInstallModal(true);
    
    // Optional: If you want to continue to booking page (for web users)
    // navigate(`/bus/booking?busId=${busId}&seats=${selectedSeats.join(',')}&from=${from}&to=${to}&date=${date}`);
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
      // Mini Van: Rows 1-5
      const rows = [...new Set(deckSeats.map(s => s.row))].sort((a, b) => a - b);
      
      return (
        <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
          {rows.map(row => {
            const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => a.column.localeCompare(b.column));
            
            if (row === 1) {
              // Row 1: Only C1, D1
              return (
                <div key={row} className="grid grid-cols-4 gap-1.5 w-full">
                  <div></div>
                  <div></div>
                  {rowSeats.map(seat => (
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
              );
            } else if (row === 2) {
              // Row 2: A2, B2, C2
              return (
                <div key={row} className="grid grid-cols-4 gap-1.5 w-full">
                  {rowSeats.map(seat => (
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
              );
            } else if (row === 3 || row === 4) {
              // Rows 3-4: A, B, [gap], D
              return (
                <div key={row} className="grid grid-cols-4 gap-1.5 w-full">
                  {['A', 'B', 'C', 'D'].map(col => {
                    if (col === 'C') return <div key={`gap-${row}`}></div>;
                    const seat = rowSeats.find(s => s.column === col);
                    if (!seat) return <div key={`empty-${row}-${col}`}></div>;
                    return (
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
                    );
                  })}
                </div>
              );
            } else {
              // Row 5: A5, B5, C5, D5
              return (
                <div key={row} className="grid grid-cols-4 gap-1.5 w-full">
                  {rowSeats.map(seat => (
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
              );
            }
          })}
        </div>
      );
    } else if (layout.type === 'sleeping-bus') {
      // Sleeping Bus: A B [aisle] D layout
      const rows = [...new Set(deckSeats.map(s => s.row))].sort((a, b) => a - b);
      
      return (
        <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
          {rows.map(row => {
            const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => a.column.localeCompare(b.column));
            
            // Row 6 has C6 (4 seats: A B C D)
            if (row === 6) {
              return (
                <div key={row} className="grid grid-cols-4 gap-2 w-full">
                  {['A', 'B', 'C', 'D'].map(col => {
                    const seat = rowSeats.find(s => s.column === col);
                    if (!seat) return <div key={`empty-${row}-${col}`} className="w-12"></div>;
                    return (
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
                    );
                  })}
                </div>
              );
            }
            
            // Rows 1-5: A B [aisle] D (no C)
            return (
              <div key={row} className="grid grid-cols-4 gap-2 w-full">
                {['A', 'B', 'C', 'D'].map(col => {
                  if (col === 'C') return <div key={`aisle-${row}`} className="w-12"></div>;
                  const seat = rowSeats.find(s => s.column === col);
                  if (!seat) return <div key={`empty-${row}-${col}`} className="w-12"></div>;
                  return (
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
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    } else if (layout.type === 'regular-bus') {
      // Regular Bus: A B [aisle] D E layout (no C except last row)
      const rows = [...new Set(deckSeats.map(s => s.row))].sort((a, b) => a - b);
      
      return (
        <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
          {rows.map(row => {
            const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => a.column.localeCompare(b.column));
            
            // Last row has all 5 seats: A B C D E
            if (rowSeats.some(s => s.column === 'C')) {
              return (
                <div key={row} className="grid grid-cols-5 gap-2 w-full">
                  {['A', 'B', 'C', 'D', 'E'].map(col => {
                    const seat = rowSeats.find(s => s.column === col);
                    if (!seat) return <div key={`empty-${row}-${col}`} className="w-12"></div>;
                    return (
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
                    );
                  })}
                </div>
              );
            }
            
            // Normal rows: A B [aisle] D E (no C)
            return (
              <div key={row} className="grid grid-cols-5 gap-2 w-full">
                {['A', 'B', 'C', 'D', 'E'].map(col => {
                  if (col === 'C') return <div key={`aisle-${row}`} className="w-12"></div>;
                  const seat = rowSeats.find(s => s.column === col);
                  if (!seat) return <div key={`empty-${row}-${col}`} className="w-12"></div>;
                  return (
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
                  );
                })}
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
          {/* <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium">SS</span>
            </div>
            <div>
              <p className="font-medium">Hello Saduni Silva!</p>
              <p className="text-sm text-gray-600">Where you want go</p>
            </div>
          </div> */}
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

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        feature="bus booking"
      />
    </div>
  );
}