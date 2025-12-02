import { useState } from "react";
import { Settings, Github } from "lucide-react";
import { AppProvider } from "./context";
import {
  SerialConnection,
  LiveStream,
  RecordingPanel,
  StatsPanel,
  ConfigPanel,
  ExportPanel,
  LoggerView,
} from "./components";

function AppContent() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">
                  Serial Data Collector
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Professional Data Acquisition Framework
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/chater-marzougui/serial-data-collector"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status Bar */}
        <div className="mb-8">
          <SerialConnection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700">
                  Live Data Stream
                </h2>
              </div>
              <div className="p-0">
                <LiveStream />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-700">
                  Recording Control
                </h2>
              </div>
              <div className="p-6">
                <RecordingPanel />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-700">System Logs</h2>
              </div>
              <div className="p-0">
                <LoggerView />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-700">Statistics</h2>
              </div>
              <div className="p-6">
                <StatsPanel />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-700">Export Data</h2>
              </div>
              <div className="p-6">
                <ExportPanel />
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-4">
                Quick Start Guide
              </h2>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span>Configure serial settings in the Settings menu.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span>Define data fields and class labels.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span>Connect your device and verify data stream.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span>Record data samples with optional labeling.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span>Export dataset to CSV/JSON.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Serial Data Collector Framework.
            All rights reserved.
          </p>
          <p className="mt-1">Created by Chater Marzougui</p>
        </div>
      </div>

      {/* Configuration Modal */}
      <ConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
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
