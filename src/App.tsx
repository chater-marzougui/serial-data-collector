import { useState, useEffect } from "react";
import { Settings, Github, Moon, Sun, Globe, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppProvider, ThemeProvider, useTheme } from "./context";
import { languages } from "./i18n";
import {
  SerialConnection,
  LiveStream,
  RecordingPanel,
  StatsPanel,
  ConfigPanel,
  ExportPanel,
  LoggerView,
  DataVisualization,
} from "./components";

function AppContent() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  // Set document direction based on language
  useEffect(() => {
    const currentLang = languages.find((l) => l.code === i18n.language);
    document.documentElement.dir = currentLang?.dir || "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                  {t("nav.title")}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("nav.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Language"
                >
                  <Globe className="w-5 h-5" />
                </button>
                {showLangMenu && (
                  <div className="absolute end-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          i18n.language === lang.code
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <a
                href="https://github.com/chater-marzougui/serial-data-collector"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                {t("nav.settings")}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                  {t("liveStream.title")}
                </h2>
              </div>
              <div className="p-0">
                <LiveStream />
              </div>
            </div>

            {/* Data Visualization Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className="w-full p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                    {t("visualization.title")}
                  </h2>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {showVisualization ? "▲" : "▼"}
                </span>
              </button>
              {showVisualization && (
                <div className="p-6">
                  <DataVisualization />
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                  {t("recording.title")}
                </h2>
              </div>
              <div className="p-6">
                <RecordingPanel />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                  {t("logs.title")}
                </h2>
              </div>
              <div className="p-0">
                <LoggerView />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                  {t("stats.title")}
                </h2>
              </div>
              <div className="p-6">
                <StatsPanel />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                  {t("export.title")}
                </h2>
              </div>
              <div className="p-6">
                <ExportPanel />
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
                {t("quickStart.title")}
              </h2>
              <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span>{t("quickStart.step1")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span>{t("quickStart.step2")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span>{t("quickStart.step3")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span>{t("quickStart.step4")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span>{t("quickStart.step5")}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p className="mt-1">{t("footer.author")}</p>
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
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
