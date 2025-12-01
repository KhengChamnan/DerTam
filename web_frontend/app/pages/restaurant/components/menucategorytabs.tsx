import { UtensilsCrossed, Coffee, Cookie, MoreHorizontal } from "lucide-react";

interface MenuCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categoryIcons: Record<string, any> = {
  Food: UtensilsCrossed,
  Drink: Coffee,
  Snack: Cookie,
  Others: MoreHorizontal,
};

export default function MenuCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const Icon = categoryIcons[category] || UtensilsCrossed;
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: isSelected ? '#01005B' : '#f3f4f6',
              color: isSelected ? 'white' : '#374151',
              boxShadow: isSelected ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : undefined
            }}
            onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            <Icon className="w-5 h-5" />
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
}
