import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse top-1/4 left-1/4"></div>
        <div className="absolute w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse bottom-1/4 right-1/4 animation-delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Spinner with glow effect */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-primary/50 blur-xl opacity-50 animate-spin"></div>
          
          {/* Main spinner */}
          <div className="relative w-24 h-24 rounded-full border-4 border-border">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-spin"></div>
          </div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground animate-pulse">
            Loading Dashboard
          </h2>
          <div className="flex gap-1 justify-center">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          </div>
          <p className="text-muted-foreground text-sm">Preparing your experience...</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse rounded-full"
               style={{ 
                 animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s linear infinite',
                 backgroundSize: '200% 100%'
               }}></div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}