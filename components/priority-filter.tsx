'use client';

interface PriorityFilterProps {
  selectedPriorities: string[];
  onPriorityChange: (priorities: string[]) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function PriorityFilter({ selectedPriorities, onPriorityChange, onRefresh, isRefreshing }: PriorityFilterProps) {
  const priorities = ['P2', 'P3', 'P4'];

  const handlePriorityToggle = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter(p => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  };

  return (
    <div className="flex gap-6 items-center justify-between flex-wrap">
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">Filter by Priority:</span>
        {priorities.map(priority => (
          <label key={priority} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPriorities.includes(priority)}
              onChange={() => handlePriorityToggle(priority)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{priority}</span>
          </label>
        ))}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
}