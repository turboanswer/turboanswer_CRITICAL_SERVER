interface TurboLogoProps {
  size?: number;
  className?: string;
}

export function TurboLogo({ size = 64, className = "" }: TurboLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        className="drop-shadow-2xl"
      >
        {/* Enhanced gradients for maximum power */}
        <defs>
          <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="25%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="75%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>
          <linearGradient id="bgPowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F0F0F" />
            <stop offset="50%" stopColor="#1A1A1A" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer power ring */}
        <circle 
          cx="100" 
          cy="100" 
          r="95" 
          fill="url(#bgPowerGradient)" 
          stroke="url(#powerGradient)" 
          strokeWidth="4"
          filter="url(#glow)"
        />
        
        {/* Inner power ring */}
        <circle 
          cx="100" 
          cy="100" 
          r="75" 
          fill="none" 
          stroke="url(#powerGradient)" 
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Enhanced lightning bolt with power */}
        <path 
          d="M125 50L75 100h25l-15 50 40-50h-25z" 
          fill="url(#powerGradient)" 
          stroke="white" 
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Power indicators - enhanced */}
        <circle cx="60" cy="60" r="4" fill="url(#glowGradient)" filter="url(#glow)" />
        <circle cx="140" cy="60" r="4" fill="url(#glowGradient)" filter="url(#glow)" />
        <circle cx="140" cy="140" r="4" fill="url(#glowGradient)" filter="url(#glow)" />
        <circle cx="60" cy="140" r="4" fill="url(#glowGradient)" filter="url(#glow)" />
        
        {/* Additional maximum power elements */}
        <circle cx="40" cy="100" r="2" fill="#00FFFF" filter="url(#glow)" />
        <circle cx="160" cy="100" r="2" fill="#00FFFF" filter="url(#glow)" />
        <circle cx="100" cy="40" r="2" fill="#00FFFF" filter="url(#glow)" />
        <circle cx="100" cy="160" r="2" fill="#00FFFF" filter="url(#glow)" />
        
        {/* Enhanced text with power styling */}
        <text 
          x="100" 
          y="165" 
          textAnchor="middle" 
          className="fill-white font-bold tracking-wider"
          style={{ fontSize: '16px' }}
          filter="url(#glow)"
        >
          TURBO
        </text>
        <text 
          x="100" 
          y="185" 
          textAnchor="middle" 
          className="fill-purple-300"
          style={{ fontSize: '12px' }}
        >
          MAXIMUM POWER AI
        </text>
      </svg>
    </div>
  );
}