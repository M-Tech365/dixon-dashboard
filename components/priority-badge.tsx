interface PriorityBadgeProps {
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getStyles = () => {
    switch (priority) {
      case 'P1':
        return 'bg-red-500 text-white';
      case 'P2':
        return 'bg-orange-500 text-white';
      case 'P3':
        return 'bg-yellow-500 text-white';
      case 'P4':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStyles()}`}>
      {priority}
    </span>
  );
}