import React from 'react';

export const Loader: React.FC<{ text?: string }> = ({ text = 'Loading forecasts...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center space-x-3">
        <div className="ink-brutalist-loader">
          <span />
          <span />
          <span />
        </div>
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-black">
          {text}
        </span>
      </div>
    </div>
  );
};
