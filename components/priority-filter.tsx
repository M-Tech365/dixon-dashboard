'use client';

interface PriorityFilterProps {
  selectedPriorities: string[];
  onPriorityChange: (priorities: string[]) => void;
}

export function PriorityFilter({ selectedPriorities, onPriorityChange }: PriorityFilterProps) {
  const priorities = ['P2', 'P3', 'P4'];

  const handlePriorityToggle = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter(p => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  };

  return (
    <div className="flex gap-2">
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
  );
}