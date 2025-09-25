import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/CFITireLog.svg"
            alt="CFI Tire Logo"
            width={120}
            height={120}
            className="bg-white rounded-lg p-3 shadow-md"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dixon Dashboard</h1>
        <p className="text-gray-600 mb-8">Service Tech Priority Dashboard</p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}