export default function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl animate-shimmer relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        
        {/* Logo placeholder */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Card title */}
        <div className="w-48 h-8 bg-gray-700 rounded animate-pulse mb-4"></div>
        
        {/* Client info */}
        <div className="space-y-3 mb-6">
          <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-40 h-6 bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Card details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-28 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* QR Code placeholder */}
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-gray-700 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
