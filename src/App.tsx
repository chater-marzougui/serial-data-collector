import { AppProvider } from './context';
import {
  SerialConnection,
  LiveStream,
  RecordingPanel,
  StatsPanel,
  ConfigPanel,
  ExportPanel,
  LoggerView,
} from './components';

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Serial Data Collector
          </h1>
          <p className="text-gray-300">
            Generic framework for collecting and labeling serial data from any device
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <SerialConnection />
        </div>

        {/* Configuration Panel */}
        <div className="mb-6">
          <ConfigPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recording & Live Stream */}
          <div className="lg:col-span-2 space-y-6">
            <RecordingPanel />
            <LiveStream />
          </div>

          {/* Right Column - Stats, Export, Logs */}
          <div className="space-y-6">
            <StatsPanel />
            <ExportPanel />
          </div>
        </div>

        {/* Logger View */}
        <div className="mt-6">
          <LoggerView />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold mb-3">Quick Start</h2>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">1.</span>
              <span>Configure your serial settings (baud rate, delimiter, parser)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">2.</span>
              <span>Define your data fields and optional class labels</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">3.</span>
              <span>Connect your serial device (Arduino, ESP32, sensor, etc.)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">4.</span>
              <span>Start recording data with optional labels</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">5.</span>
              <span>Export your dataset as CSV with custom template</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Serial Data Collector Framework</p>
          <p className="mt-1">
            Works with any serial device — Arduino, ESP32, STM32, sensors, and more
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
