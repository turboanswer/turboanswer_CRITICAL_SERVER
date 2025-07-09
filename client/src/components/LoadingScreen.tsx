import { TurboLogo } from "./TurboLogo";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Initializing Maximum Power AI..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-8">
        {/* Enhanced logo with animation */}
        <div className="animate-pulse">
          <TurboLogo size={120} />
        </div>
        
        {/* Loading message */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-wide">
            TURBO ANSWER
          </h1>
          <h2 className="text-xl text-purple-300 font-medium">
            Maximum Power AI System
          </h2>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {message}
          </p>
        </div>
        
        {/* Enhanced loading indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Power indicators */}
        <div className="flex space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>AI Engine Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Neural Networks Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Maximum Power Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}