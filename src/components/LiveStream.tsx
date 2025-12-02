import { Trash2, Pause, Play } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "../context";

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

  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex flex-col h-96">
      <div className="flex justify-end gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={handleTogglePause}
          className={`p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium ${
            isPaused
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          }`}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <Play className="w-3 h-3" />
          ) : (
            <Pause className="w-3 h-3" />
          )}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={clearLiveData}
          className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2 text-xs font-medium"
          title="Clear"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 bg-gray-900 p-4 overflow-y-auto font-mono text-xs"
      >
        {!isConnected ? (
          <p className="text-gray-500">Connect a device to see data...</p>
        ) : displayData.length === 0 ? (
          <p className="text-gray-500">Waiting for data...</p>
        ) : (
          <pre className="text-green-400 whitespace-pre-wrap break-all">
            {displayData.join("\n")}
          </pre>
        )}
      </div>

      {isPaused && (
        <div className="bg-yellow-50 p-2 border-t border-yellow-100">
          <p className="text-yellow-700 text-xs flex items-center gap-1">
            <Pause className="w-3 h-3" />
            Stream paused - new data is being buffered
          </p>
        </div>
      )}
    </div>
  );
}

export default LiveStream;
