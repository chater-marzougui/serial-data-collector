import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  AppConfig,
  RecordedSample,
  ConnectionStatus,
  CollectionStats,
  LogEntry,
} from '../types';
import {
  configLoader,
  logger,
  createSerialManager,
  createParser,
  rulesEngine,
  createFormatter,
  downloadCSV,
} from '../core';
import type SerialManager from '../core/SerialManager';
import type DataParser from '../core/DataParser';
import type TemplateFormatter from '../core/TemplateFormatter';
import type { AppContextType } from './useApp';
import { AppContext } from './context';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // State
  const [config, setConfig] = useState<AppConfig>(() => configLoader.loadFromStorage());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [liveData, setLiveData] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentClass, setCurrentClass] = useState<string | null>(null);
  const [recordedSamples, setRecordedSamples] = useState<RecordedSample[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<CollectionStats>({
    totalSamples: 0,
    classCounts: {},
  });

  // Refs for managers
  const serialManagerRef = useRef<SerialManager | null>(null);
  const parserRef = useRef<DataParser | null>(null);
  const formatterRef = useRef<TemplateFormatter | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecordingRef = useRef(false);
  const currentClassRef = useRef<string | null>(null);
  const configRef = useRef(config);

  // Update configRef when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Stop recording function - defined first so it can be referenced
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    currentClassRef.current = null;
    setIsRecording(false);
    setCurrentClass(null);

    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    logger.info('Recording stopped');
  }, []);

  // Handle incoming data
  const handleIncomingData = useCallback((line: string) => {
    // Update live data display
    setLiveData((prev) => [...prev.slice(-100), line]);

    // Parse the line
    const parsed = parserRef.current?.parse(line);
    if (!parsed) return;

    // Apply rules
    const ruleResult = rulesEngine.evaluate(parsed);

    if (ruleResult.action === 'ignore') {
      logger.debug('Data ignored by rule', { ruleId: ruleResult.ruleId });
      return;
    }

    if (ruleResult.action === 'log') {
      logger.info('Rule triggered log', { data: parsed, ruleId: ruleResult.ruleId });
      return;
    }

    // Handle recording
    if (isRecordingRef.current) {
      const sample: RecordedSample = {
        ...parsed,
        recordedAt: Date.now(),
        label: ruleResult.action === 'label' 
          ? ruleResult.value 
          : currentClassRef.current || undefined,
      };

      setRecordedSamples((prev) => [...prev, sample]);
      
      // Update stats
      const label = sample.label || 'unlabeled';
      setStats((prev) => ({
        ...prev,
        totalSamples: prev.totalSamples + 1,
        classCounts: {
          ...prev.classCounts,
          [label]: (prev.classCounts[label] || 0) + 1,
        },
        lastSampleTime: Date.now(),
      }));
    }
  }, []);

  // Initialize managers
  useEffect(() => {
    const currentConfig = configRef.current;
    serialManagerRef.current = createSerialManager(currentConfig.serial);
    parserRef.current = createParser(currentConfig.parser, currentConfig.fields);
    formatterRef.current = createFormatter(currentConfig.export.template, currentConfig.fields);
    rulesEngine.setRules(currentConfig.rules);

    // Set up logger
    logger.setLevel(currentConfig.logging.level);
    logger.setMaxEntries(currentConfig.logging.maxEntries);
    logger.setPersistToFile(currentConfig.logging.persistToFile);

    // Subscribe to logs
    const unsubscribeLogs = logger.subscribe((entry) => {
      setLogs((prev) => [...prev.slice(-999), entry]);
    });

    // Subscribe to serial status changes
    const unsubscribeStatus = serialManagerRef.current.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    // Subscribe to serial data
    const unsubscribeData = serialManagerRef.current.onData((line) => {
      handleIncomingData(line);
    });

    logger.info('Application initialized');

    return () => {
      unsubscribeLogs();
      unsubscribeStatus();
      unsubscribeData();
      serialManagerRef.current?.disconnect();
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    };
  }, [handleIncomingData]);

  // Update managers when config changes
  useEffect(() => {
    if (serialManagerRef.current) {
      serialManagerRef.current.updateConfig(config.serial);
    }
    if (parserRef.current) {
      parserRef.current.updateConfig(config.parser, config.fields);
    }
    if (formatterRef.current) {
      formatterRef.current.updateTemplate(config.export.template);
      formatterRef.current.updateFields(config.fields);
    }
    rulesEngine.setRules(config.rules);
    logger.setLevel(config.logging.level);
    logger.setMaxEntries(config.logging.maxEntries);
    logger.setPersistToFile(config.logging.persistToFile);
  }, [config]);

  // Configuration methods
  const updateConfig = useCallback((partial: Partial<AppConfig>) => {
    const newConfig = configLoader.updateConfig(partial);
    setConfig(newConfig);
  }, []);

  const resetConfig = useCallback(() => {
    const newConfig = configLoader.resetToDefaults();
    setConfig(newConfig);
  }, []);

  const importConfigFn = useCallback((json: string) => {
    const newConfig = configLoader.importConfig(json);
    setConfig(newConfig);
  }, []);

  const exportConfigJson = useCallback(() => {
    return configLoader.exportConfig();
  }, []);

  // Serial connection methods
  const connect = useCallback(async () => {
    if (!serialManagerRef.current) return false;
    return serialManagerRef.current.connect();
  }, []);

  const disconnect = useCallback(async () => {
    if (!serialManagerRef.current) return;
    await serialManagerRef.current.disconnect();
  }, []);

  // Live data methods
  const clearLiveData = useCallback(() => {
    setLiveData([]);
  }, []);

  // Recording methods
  const startRecording = useCallback((classId?: string) => {
    const currentConfig = configRef.current;
    if (currentConfig.recording.enableLabeling && !classId) {
      logger.warn('No class selected for recording');
      return;
    }

    isRecordingRef.current = true;
    currentClassRef.current = classId || null;
    setIsRecording(true);
    setCurrentClass(classId || null);
    
    setStats((prev) => ({
      ...prev,
      startTime: prev.startTime || Date.now(),
    }));

    logger.info('Recording started', { classId });

    // Auto-stop timer
    if (currentConfig.recording.autoStopSeconds > 0) {
      recordingTimerRef.current = setTimeout(() => {
        stopRecording();
      }, currentConfig.recording.autoStopSeconds * 1000);
    }
  }, [stopRecording]);

  const clearRecordedSamples = useCallback(() => {
    setRecordedSamples([]);
    setStats({
      totalSamples: 0,
      classCounts: {},
    });
    logger.info('Recorded samples cleared');
  }, []);

  // Export methods
  const exportData = useCallback(() => {
    if (recordedSamples.length === 0) {
      logger.warn('No data to export');
      return;
    }

    if (!formatterRef.current) return;

    const csv = formatterRef.current.generateCSV(recordedSamples, config.export);
    const filename = formatterRef.current.generateFilename(config.export.filename);
    downloadCSV(csv, filename);
  }, [recordedSamples, config.export]);

  const previewExport = useCallback(() => {
    if (!formatterRef.current || recordedSamples.length === 0) {
      return ['No data to preview'];
    }
    return formatterRef.current.previewExport(recordedSamples, 5);
  }, [recordedSamples]);

  // Logging methods
  const clearLogs = useCallback(() => {
    logger.clear();
    setLogs([]);
  }, []);

  const downloadLogsFile = useCallback(() => {
    logger.downloadLogs();
  }, []);

  const isSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  const value: AppContextType = {
    config,
    updateConfig,
    resetConfig,
    importConfig: importConfigFn,
    exportConfig: exportConfigJson,

    connectionStatus,
    connect,
    disconnect,
    isSerialSupported,

    liveData,
    clearLiveData,

    isRecording,
    currentClass,
    startRecording,
    stopRecording,
    recordedSamples,
    clearRecordedSamples,

    stats,

    exportData,
    previewExport,

    logs,
    clearLogs,
    downloadLogs: downloadLogsFile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
