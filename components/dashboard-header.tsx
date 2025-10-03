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
    <div className="bg-white text-gray-800 p-[2vh] shadow-lg border-b">
      <div className="flex flex-col items-center gap-[1.5vh]">
        <Image
          src="/CFITireLogo.svg"
          alt="CFI Tire Logo"
          width={200}
          height={200}
          className="w-[12vw] h-auto max-w-[300px]"
        />
        <div className="text-center">
          <h1 className="text-[5vw] font-bold leading-tight">Priority Dashboard</h1>
          <p className="text-[2vw] text-gray-600 mt-[1vh]">Business Central Sales Orders (P2-P4)</p>
        </div>
        <div className="text-center">
          {lastRefresh && (
            <p className="text-[1.5vw] text-gray-600">
              Last Updated: {formatTime(lastRefresh)}
            </p>
          )}
          <p className="text-[1.2vw] text-gray-500 mt-[0.5vh]">
            {isRefreshing ? 'Refreshing...' : 'Auto-refresh every 5 minutes'}
          </p>
        </div>
      </div>
    </div>
  );
}