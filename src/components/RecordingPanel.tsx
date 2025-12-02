import { Circle, StopCircle } from 'lucide-react';
import { useApp } from '../context';

// Color palette for dynamic classes
const CLASS_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

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

  const isConnected = connectionStatus === 'connected';
  const enableLabeling = config.recording.enableLabeling;
  const classes = config.classes;
  const autoStopSeconds = config.recording.autoStopSeconds;

  // No labeling mode - simple record button
  if (!enableLabeling) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold mb-4">Record Data</h2>

        {!isConnected && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4">
            <p className="text-yellow-200">
              ⚠️ Connect device first to start recording
            </p>
          </div>
        )}

        <button
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          disabled={!isConnected}
          className={`w-full p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
            isRecording
              ? 'bg-red-500 border-red-400 animate-pulse'
              : 'bg-blue-500 border-transparent hover:scale-105'
          } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isRecording ? (
            <StopCircle className="w-12 h-12" />
          ) : (
            <Circle className="w-12 h-12" />
          )}
          <span className="font-bold text-lg">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </span>
          <span className="text-sm opacity-80">
            {isRecording
              ? `Recording... ${stats.totalSamples} samples`
              : `${stats.totalSamples} samples collected`}
          </span>
        </button>

        {isRecording && autoStopSeconds > 0 && (
          <p className="text-sm text-gray-400 mt-2 text-center">
            Auto-stops in {autoStopSeconds} seconds
          </p>
        )}
      </div>
    );
  }

  // Labeling mode - class buttons
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold mb-4">Record Labeled Data</h2>

      {!isConnected && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4">
          <p className="text-yellow-200">
            ⚠️ Connect device first to start recording
          </p>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-gray-300">
            No classes configured. Add classes in the Config panel.
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${classes.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {classes.map((cls, index) => {
            const isCurrentlyRecording = isRecording && currentClass === cls.id;
            const count = stats.classCounts[cls.id] || 0;
            const colorClass = cls.color || CLASS_COLORS[index % CLASS_COLORS.length];

            return (
              <button
                key={cls.id}
                onClick={() =>
                  isCurrentlyRecording
                    ? stopRecording()
                    : startRecording(cls.id)
                }
                disabled={!isConnected || (isRecording && currentClass !== cls.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isCurrentlyRecording
                    ? 'bg-red-500 border-red-400 animate-pulse'
                    : `${colorClass} border-transparent hover:scale-105`
                } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <Circle className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold text-sm mb-1 truncate">{cls.name}</h3>
                <p className="text-xs opacity-80">
                  {isCurrentlyRecording ? 'Recording...' : `${count} samples`}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {isRecording && (
        <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-4">
          <p className="font-semibold">
            🔴 Recording: {classes.find((c) => c.id === currentClass)?.name}
          </p>
          {autoStopSeconds > 0 && (
            <p className="text-sm mt-1">Auto-stops in {autoStopSeconds} seconds.</p>
          )}
          <button
            onClick={stopRecording}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
          >
            Stop Recording
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordingPanel;
