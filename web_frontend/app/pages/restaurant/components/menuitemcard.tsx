import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    // Simulate adding to cart
    setTimeout(() => {
      alert(`${item.name} added to your order!\nPrice: $${item.price}\n\nYou can now proceed to checkout or continue browsing the menu.`);
    }, 100);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 transition-colors" style={{ color: isAdded ? '#01005B' : undefined }}>
          {item.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold" style={{ color: '#01005B' }}>${item.price}</span>
          {/* <button 
            onClick={handleAddToCart}
            className="px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1.5 text-white"
            style={{ 
              backgroundColor: isAdded ? '#16a34a' : '#01005B'
            }}
            onMouseEnter={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#01005B')}
            onMouseLeave={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#01005B')}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button> */}
        </div>
      </div>
    </div>
  );
}
