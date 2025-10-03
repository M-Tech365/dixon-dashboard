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
    <div className="flex gap-[2vw] items-center justify-between flex-wrap">
      <div className="flex gap-[2vw] items-center">
        <span className="text-[1.8vw] font-bold text-gray-700">Filter by Priority:</span>
        {priorities.map(priority => (
          <label key={priority} className="flex items-center gap-[0.8vw] cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPriorities.includes(priority)}
              onChange={() => handlePriorityToggle(priority)}
              className="w-[1.5vw] h-[1.5vw] text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-[1.5vw] font-semibold text-gray-700">{priority}</span>
          </label>
        ))}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-[2vw] py-[1.5vh] bg-blue-600 text-white text-[1.5vw] rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-[1vw] font-bold shadow-lg"
        >
          <svg
            className={`w-[1.5vw] h-[1.5vw] ${isRefreshing ? 'animate-spin' : ''}`}
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