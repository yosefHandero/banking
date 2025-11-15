import { transactionCategoryStyles } from '@/constants';

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const styles = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default;

  return (
    <div
      className={`flex items-center justify-center rounded-full px-3 py-1 ${styles.chipBackgroundColor} border ${styles.borderColor}`}
    >
      <p className={`text-12 font-medium ${styles.textColor}`}>
        {category}
      </p>
    </div>
  );
}

