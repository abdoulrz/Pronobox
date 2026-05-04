import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onChange,
}) => {
  return (
    <div className="card mb-4 overflow-hidden">
      <div className="px-4 py-2 border-b border-brand-slate/30 dark:border-brand-slate">
        <div
          className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          aria-label="Filtrer par catégorie"
        >
          <button
            role="tab"
            aria-selected={activeCategory === 'all' ? "true" : "false"}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              activeCategory === 'all'
                ? 'bg-brand-green text-white shadow-[0_2px_8px_rgba(34,197,94,0.4)]'
                : 'bg-slate-100 dark:bg-brand-navy-2 text-slate-600 dark:text-brand-text-2 border border-slate-200 dark:border-brand-slate hover:border-brand-green/40 hover:text-brand-green'
            }`}
            onClick={() => onChange('all')}
          >
            Tous les débats
          </button>
          {categories
            .filter((cat) => cat !== 'all')
            .map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category ? "true" : "false"}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeCategory === category
                    ? 'bg-brand-green text-white shadow-[0_2px_8px_rgba(34,197,94,0.4)]'
                    : 'bg-slate-100 dark:bg-brand-navy-2 text-slate-600 dark:text-brand-text-2 border border-slate-200 dark:border-brand-slate hover:border-brand-green/40 hover:text-brand-green'
                }`}
                onClick={() => onChange(category)}
              >
                {category}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
