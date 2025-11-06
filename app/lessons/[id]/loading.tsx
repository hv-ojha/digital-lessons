/**
 * Loading UI for Lesson Detail Page
 * Shown while the lesson is being fetched from the server
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-2xl animate-bounce-in">
        {/* Loading Sparky */}
        <svg
          viewBox="0 0 200 200"
          className="w-32 h-32 mx-auto mb-6 animate-float"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="loadingSparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
            fill="url(#loadingSparkGradient)"
            stroke="#7C3AED"
            strokeWidth="3"
          />
          <circle cx="85" cy="85" r="8" fill="white" />
          <circle cx="115" cy="85" r="8" fill="white" />
          <circle cx="87" cy="87" r="4" fill="#1F2937" />
          <circle cx="117" cy="87" r="4" fill="#1F2937" />
          <path
            d="M 85 105 L 115 105"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <h1 className="font-display text-4xl font-extrabold gradient-text-magic mb-4">
          Loading Lesson...
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Sparky is preparing your learning adventure! Just a moment...
        </p>
      </div>
    </div>
  );
}
