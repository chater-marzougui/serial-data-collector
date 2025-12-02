import { useApp } from '../context';

export function StatsPanel() {
  const { config, stats, recordedSamples } = useApp();
  const classes = config.classes;
  const enableLabeling = config.recording.enableLabeling;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-bold mb-4">Collection Statistics</h2>

      {enableLabeling && classes.length > 0 ? (
        <div className="space-y-3 mb-6">
          {classes.map((cls) => (
            <div key={cls.id} className="flex justify-between items-center">
              <span className="font-medium truncate mr-2">{cls.name}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                {stats.classCounts[cls.id] || 0}
              </span>
            </div>
          ))}
          
          {/* Show unlabeled count if any */}
          {stats.classCounts['unlabeled'] && (
            <div className="flex justify-between items-center text-gray-400">
              <span className="font-medium">Unlabeled</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold">
                {stats.classCounts['unlabeled']}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">Samples</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              {stats.totalSamples}
            </span>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-white/20 flex justify-between items-center">
        <span className="font-bold">Total Samples</span>
        <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold">
          {recordedSamples.length}
        </span>
      </div>

      {stats.startTime && (
        <div className="mt-4 text-sm text-gray-400">
          <p>Started: {new Date(stats.startTime).toLocaleTimeString()}</p>
          {stats.lastSampleTime && (
            <p>Last sample: {new Date(stats.lastSampleTime).toLocaleTimeString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
