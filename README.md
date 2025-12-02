# Serial Data Collector

A modular, config-driven web application for collecting, labeling, and exporting serial data from **any** device. Built with React, TypeScript, and the Web Serial API.

> **Perfect for hobbyists, researchers, engineers, and ML enthusiasts** who need to collect structured datasets from serial devices — Arduino, ESP32, STM32, sensors, medical devices, robots, or any microcontroller.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)

## ✨ Features

### 🔌 Device-Agnostic Serial Connection
- Connect to any COM/serial port via Web Serial API
- Configurable baud rate (9600 to 921600)
- Custom delimiter and encoding support
- Auto-reconnection on disconnect
- Real-time connection status

### 📊 Flexible Data Parsing
- **Split parsing**: Parse CSV-like data by delimiter
- **Regex parsing**: Extract fields with regular expressions
- **JSON parsing**: Parse structured JSON messages
- **Custom parser**: Define your own parsing logic
- Skip lines matching patterns (comments, debug messages)

### 🏷️ Configurable Class Labeling
- Define unlimited classes/labels
- Optional labeling — can record without labels
- Color-coded class buttons
- Auto-stop recording timer

### 🔧 Rule Engine
Define automatic triggers:
```
"if fieldX > 300 then label='spike'"
"if line contains 'ERR' then ignore"
"if regex matches /^SYS:/ then log only"
```

### 📤 Template-Driven Export
- Custom CSV export templates: `${timestamp},${ax},${flag},${label}`
- Live preview before export
- Missing field warnings
- Configurable filename patterns

### 📝 Logging System
- Log levels: debug, info, warn, error
- In-browser log viewer
- Downloadable log files
- Persistent storage option

### ⚙️ Configuration Management
- JSON-based configuration
- Import/export config files
- Browser localStorage persistence
- Reset to defaults

## 🚀 Quick Start

### Prerequisites
- **Browser**: Chrome, Edge, or Opera (Web Serial API support required)
- **Node.js**: 18+ (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/chater-marzougui/serial-data-collector.git
cd serial-data-collector

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Configure your serial settings** (baud rate, delimiter, parser type)
2. **Define your data fields** matching your device output
3. **Optionally configure class labels** for supervised learning datasets
4. **Connect your serial device** using the Connect button
5. **Start recording** — with or without labels
6. **Export your dataset** as CSV with your custom template

## 📁 Project Structure

```
src/
├── core/                    # Core utilities
│   ├── SerialManager.ts     # Serial connection handling
│   ├── DataParser.ts        # Pluggable data parsing
│   ├── TemplateFormatter.ts # CSV export formatting
│   ├── RulesEngine.ts       # Conditional trigger rules
│   ├── ConfigLoader.ts      # Configuration management
│   └── Logger.ts            # Logging system
├── components/              # React UI components
│   ├── SerialConnection.tsx # Connection controls
│   ├── LiveStream.tsx       # Real-time data display
│   ├── RecordingPanel.tsx   # Recording controls
│   ├── StatsPanel.tsx       # Statistics display
│   ├── ConfigPanel.tsx      # Configuration UI
│   ├── ExportPanel.tsx      # Export controls
│   └── LoggerView.tsx       # Log viewer
├── context/                 # React context
│   └── AppContext.tsx       # Global state management
├── types/                   # TypeScript definitions
│   └── index.ts
└── App.tsx                  # Main application
```

## ⚙️ Configuration

Configuration is stored in `public/config.json` or managed via the UI:

```json
{
  "serial": {
    "baudRate": 115200,
    "delimiter": "\n",
    "encoding": "utf-8"
  },
  "parser": {
    "type": "split",
    "splitDelimiter": ",",
    "skipLines": ["#", "/^DEBUG:/"]
  },
  "fields": ["timestamp", "ax", "ay", "az", "gx", "gy", "gz"],
  "classes": [
    { "id": "walking", "name": "Walking", "color": "bg-blue-500" },
    { "id": "running", "name": "Running", "color": "bg-green-500" },
    { "id": "sitting", "name": "Sitting", "color": "bg-purple-500" }
  ],
  "rules": [
    {
      "id": "rule1",
      "condition": "ax > 1000",
      "action": "label",
      "value": "impact",
      "enabled": true
    }
  ],
  "export": {
    "template": "${timestamp},${ax},${ay},${az},${label}",
    "filename": "dataset_${timestamp}",
    "includeHeader": true
  },
  "recording": {
    "autoStopSeconds": 10,
    "enableLabeling": true
  },
  "logging": {
    "level": "info",
    "persistToFile": false,
    "maxEntries": 1000
  }
}
```

### Parser Types

#### Split Parser
For CSV-like data:
```
1234567890,150,-200,980,10,20,30
```

#### Regex Parser
For complex patterns:
```
Sensor: ts=1234567890 ax=150 ay=-200 az=980
```
Regex: `^Sensor: ts=(\d+) ax=(-?\d+) ay=(-?\d+) az=(-?\d+)`

#### JSON Parser
For structured data:
```json
{"timestamp":1234567890,"ax":150,"ay":-200,"az":980}
```

### Rule Syntax

| Condition | Example |
|-----------|---------|
| Numeric comparison | `ax > 1000` |
| String contains | `line contains 'ERR'` |
| Regex match | `regex matches /^SYS:/` |
| Field exists | `field exists temperature` |
| String equals | `status equals 'OK'` |
| Line prefix | `line startsWith 'DATA:'` |
| Boolean check | `isValid is true` |

## 🔧 Development

```bash
# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### GitHub Pages (Automatic)
Push to `main` branch triggers automatic deployment via GitHub Actions.

### Manual Deployment
```bash
npm run build
# Upload contents of dist/ to your web server
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with ❤️ for the maker community
