import Image from 'next/image';

interface DashboardHeaderProps {
  lastRefresh: Date | null;
  isRefreshing: boolean;
}

export function DashboardHeader({ lastRefresh, isRefreshing }: DashboardHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white text-gray-800 p-[1vh] shadow-lg border-b">
      <div className="flex items-center justify-between px-[2vw]">
        <Image
          src="/CFITireLogo.svg"
          alt="CFI Tire Logo"
          width={200}
          height={200}
          className="w-[6vw] h-auto max-w-[120px]"
        />
        <div className="text-center flex-1">
          <h1 className="text-[3vw] font-bold leading-tight">Priority Dashboard</h1>
          <p className="text-[1.2vw] text-gray-600">Business Central Sales Orders (P2-P4)</p>
        </div>
        <div className="text-right">
          {lastRefresh && (
            <p className="text-[1vw] text-gray-600">
              Last Updated: {formatTime(lastRefresh)}
            </p>
          )}
          <p className="text-[0.8vw] text-gray-500">
            {isRefreshing ? 'Refreshing...' : 'Auto-refresh every 5 minutes'}
          </p>
        </div>
      </div>
    </div>
  );
}