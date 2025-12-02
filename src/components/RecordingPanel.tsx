import { Circle, StopCircle } from "lucide-react";
import { useApp } from "../context";

export function RecordingPanel() {
  const {
    config,
    connectionStatus,
    isRecording,
    currentClass,
    startRecording,
    stopRecording,
    stats,
  } = useApp();

  const isConnected = connectionStatus === "connected";
  const enableLabeling = config.recording.enableLabeling;
  const classes = config.classes;
  const autoStopSeconds = config.recording.autoStopSeconds;

  // No labeling mode - simple record button
  if (!enableLabeling) {
    return (
      <div>
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Connect device first to start recording
            </p>
          </div>
        )}

        <button
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          disabled={!isConnected}
          className={`w-full p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
            isRecording
              ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
              : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400`}
        >
          {isRecording ? (
            <StopCircle className="w-12 h-12" />
          ) : (
            <Circle className="w-12 h-12" />
          )}
          <span className="font-bold text-lg">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </span>
          <span className="text-sm opacity-80">
            {isRecording
              ? `Recording... ${stats.totalSamples} samples`
              : `${stats.totalSamples} samples collected`}
          </span>
        </button>

        {isRecording && autoStopSeconds > 0 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Auto-stops in {autoStopSeconds} seconds
          </p>
        )}
      </div>
    );
  }

  // Labeling mode - class buttons
  return (
    <div>
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ Connect device first to start recording
          </p>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-500">
            No classes configured. Add classes in the Config panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {classes.map((cls) => {
            const isActive = isRecording && currentClass === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => {
                  if (isRecording && currentClass === cls.id) {
                    stopRecording();
                  } else {
                    startRecording(cls.id);
                  }
                }}
                disabled={!isConnected}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                  isActive
                    ? `${cls.color} text-white border-transparent shadow-md scale-105`
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <span className="font-bold text-lg">{cls.name}</span>
                {isActive && (
                  <span className="text-xs animate-pulse">Recording...</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isRecording && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => stopRecording()}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors font-bold"
          >
            <StopCircle className="w-5 h-5" />
            Stop Recording ({stats.totalSamples} samples)
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordingPanel;
