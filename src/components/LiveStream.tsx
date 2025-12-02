import { Trash2, Pause, Play } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context';

export function LiveStream() {
  const { liveData, clearLiveData, connectionStatus } = useApp();
  const [isPaused, setIsPaused] = useState(false);
  const [pausedData, setPausedData] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // When pausing, capture current data; when unpausing, clear captured data
  const handleTogglePause = () => {
    if (!isPaused) {
      setPausedData(liveData);
    }
    setIsPaused(!isPaused);
  };

  // Display either live data or paused snapshot
  const displayData = useMemo(() => {
    return isPaused ? pausedData : liveData;
  }, [isPaused, pausedData, liveData]);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayData, isPaused]);

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Live Data Stream</h2>
        <div className="flex gap-2">
          <button
            onClick={handleTogglePause}
            className={`p-2 rounded-lg transition-colors ${
              isPaused 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={clearLiveData}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="bg-black/30 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs"
      >
        {!isConnected ? (
          <p className="text-gray-500">Connect a device to see data...</p>
        ) : displayData.length === 0 ? (
          <p className="text-gray-500">Waiting for data...</p>
        ) : (
          <pre className="text-green-400 whitespace-pre-wrap break-all">
            {displayData.join('\n')}
          </pre>
        )}
      </div>

      {isPaused && (
        <p className="text-yellow-400 text-sm mt-2 flex items-center gap-1">
          <Pause className="w-3 h-3" />
          Stream paused - new data is being buffered
        </p>
      )}
    </div>
  );
}

export default LiveStream;
