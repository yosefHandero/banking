import { transactionCategoryStyles } from '@/constants';

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const styles = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default;

  return (
    <div
      className={`flex items-center justify-center rounded-full px-2.5 py-0.5 ${styles.chipBackgroundColor || 'bg-blue-500/20'} ${styles.borderColor ? `border ${styles.borderColor}` : ''}`}
    >
      <p className={`text-12 font-medium ${styles.textColor || 'text-blue-400'}`}>
        {category}
      </p>
    </div>
  );
}

