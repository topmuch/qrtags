/**
 * OBJECT-CATEGORIES-FEATURE: Object Category Selector Component
 *
 * Sélecteur visuel de catégorie d'objet : grid de 20 catégories.
 * Les 5 principales sont mises en avant.
 * Chaque bouton affiche l'emoji + label i18n + description.
 *
 * Style:
 *   - Non sélectionné: carte blanche + bordure noire dashed.
 *   - Sélectionné: carte jaune moutarde #c5a643 + bordure noire solide
 *     + checkmark noir en haut à droite.
 */

'use client';

import type { ObjectCategory } from '@/lib/object-categories';
import {
  FEATURED_CATEGORIES,
  OBJECT_CATEGORY_LIST,
  OBJECT_ICONS,
  OBJECT_LABELS,
  OBJECT_DESCRIPTIONS,
} from '@/lib/object-categories';
import type { Language } from '@/lib/i18n';

interface ObjectCategorySelectorProps {
  /** Category currently selected */
  selectedCategory: ObjectCategory | '';
  /** Callback when a category is selected */
  onSelect: (category: ObjectCategory) => void;
  /** Translation function */
  t: (key: string) => string;
  /** Current language */
  lang: Language;
}

export default function ObjectCategorySelector({
  selectedCategory,
  onSelect,
  t,
  lang,
}: ObjectCategorySelectorProps) {
  const otherCategories = OBJECT_CATEGORY_LIST.filter(
    (cat) => !FEATURED_CATEGORIES.includes(cat)
  );

  return (
    <div className="space-y-4">
      {/* Featured categories */}
      <div>
        <p className="text-xs uppercase tracking-widest text-black font-bold mb-3">
          {t('objects.featured_title')}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {FEATURED_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const icon = OBJECT_ICONS[category];
            const label = OBJECT_LABELS[category][lang] ?? OBJECT_LABELS[category].fr;
            const description = OBJECT_DESCRIPTIONS[category][lang] ?? OBJECT_DESCRIPTIONS[category].fr;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelect(category)}
                aria-pressed={isSelected}
                aria-label={label}
                className={`
                  relative flex flex-col items-center justify-center
                  rounded-xl p-4 sm:p-5 min-h-[110px] sm:min-h-[120px]
                  border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                  ${
                    isSelected
                      ? 'border-black border-solid bg-[#c5a643] shadow-lg shadow-black/20 scale-[1.02]'
                      : 'border-black border-dashed bg-white hover:bg-black/5'
                  }
                `}
              >
                <span className="text-3xl sm:text-4xl mb-1.5">{icon}</span>
                <span className="text-sm sm:text-base font-bold text-black transition-colors">
                  {label}
                </span>
                <span className="text-[10px] sm:text-xs mt-0.5 leading-tight text-center text-black/70">
                  {description}
                </span>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center ring-2 ring-white">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#c5a643" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* All other categories */}
      <div>
        <p className="text-xs uppercase tracking-widest text-black font-bold mb-3">
          {t('objects.other_title')}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {otherCategories.map((category) => {
            const isSelected = selectedCategory === category;
            const icon = OBJECT_ICONS[category];
            const label = OBJECT_LABELS[category][lang] ?? OBJECT_LABELS[category].fr;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelect(category)}
                aria-pressed={isSelected}
                aria-label={label}
                className={`
                  relative flex flex-col items-center justify-center
                  rounded-xl p-3 sm:p-4 min-h-[80px] sm:min-h-[90px]
                  border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1
                  ${
                    isSelected
                      ? 'border-black border-solid bg-[#c5a643] shadow-lg shadow-black/20 scale-[1.02]'
                      : 'border-black border-dashed bg-white hover:bg-black/5'
                  }
                `}
              >
                <span className="text-2xl sm:text-3xl mb-1">{icon}</span>
                <span className="text-[10px] sm:text-xs font-semibold text-black text-center leading-tight">
                  {label}
                </span>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center ring-1 ring-white">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#c5a643" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}