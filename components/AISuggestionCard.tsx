interface AISuggestionCardProps {
  suggestion: string;
  index: number;
}

export default function AISuggestionCard({ suggestion, index }: AISuggestionCardProps) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-form">
      <div className="flex size-8 items-center justify-center rounded-full bg-bankGradient text-white font-semibold">
        {index + 1}
      </div>
      <p className="text-14 text-gray-900 flex-1">{suggestion}</p>
    </div>
  );
}

