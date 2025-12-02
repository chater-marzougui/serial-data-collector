<a name="readme-top"></a>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
</div>

---

# 🔌 Serial Data Collector

**A modular, config-driven web application for collecting, labeling, and exporting serial data from any device.**
Built with ❤️ by [Chater Marzougui](https://github.com/chater-marzougui).

<br />
<div align="center">
  <a href="https://github.com/chater-marzougui/serial-data-collector">
     <img src="https://raw.githubusercontent.com/chater-marzougui/serial-data-collector/main/public/screenshots/main-light.png" alt="Serial Data Collector Screenshot" width="800">
  </a>
  <h3>Serial Data Collector</h3>
  <p align="center">
    <strong>Professional Data Acquisition Framework for Serial Devices</strong>
    <br />
    <br />
    <a href="https://github.com/chater-marzougui/serial-data-collector/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/chater-marzougui/serial-data-collector/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
      </p>
</div>

<br/>

---

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-screenshots">Screenshots</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-usage">Usage</a></li>
    <li><a href="#-configuration">Configuration</a></li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-license">License</a></li>
    <li><a href="#-contact">Contact</a></li>
  </ol>
</details>

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## About The Project

**🚀 Serial Data Collector** is a comprehensive, browser-based data acquisition framework designed for hobbyists, researchers, engineers, and ML enthusiasts who need to collect structured datasets from serial devices — Arduino, ESP32, STM32, sensors, medical devices, robots, or any microcontroller.

Built with **React 19**, **TypeScript**, and the **Web Serial API**, it provides a powerful yet intuitive interface for real-time data collection, labeling, visualization, and export.

### 🎯 Key Features

- 🔌 **Device-Agnostic Serial Connection**: Connect to any COM/serial port with configurable baud rates (9600-921600)
- 📊 **Flexible Data Parsing**: Support for Split, Regex, JSON, and custom parsers
- 🏷️ **Configurable Class Labeling**: Define unlimited classes for supervised learning datasets
- 📈 **Real-time Data Visualization**: Live charts with smart sampling for performance
- 📤 **Bidirectional Communication**: Send commands to devices with TX/RX logging
- 🌍 **Multi-language Support**: English, French, and Arabic with RTL support
- 🌙 **Dark/Light Theme**: Beautiful UI with theme persistence
- 🔧 **Rule Engine**: Automatic triggers based on data conditions

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## ✨ Features

### 🔌 Device-Agnostic Serial Connection
- Connect to any COM/serial port via Web Serial API
- Configurable baud rate (9600 to 921600)
- Custom delimiter and encoding support
- Real-time connection status

### 📊 Flexible Data Parsing
- **Split parsing**: Parse CSV-like data by delimiter
- **Regex parsing**: Extract fields with regular expressions
- **JSON parsing**: Parse structured JSON messages
- Skip lines matching patterns (comments, debug messages)

### 🏷️ Configurable Class Labeling
- Define unlimited classes/labels
- Optional labeling — can record without labels
- Color-coded class buttons
- Auto-stop recording timer

### 📤 Bidirectional Serial Communication
- Send commands to devices (text, hex, or raw bytes)
- Quick command buttons for frequently used commands
- Automated command scheduling
- Class-triggered commands
- TX/RX logging with filtering

### 🔧 Rule Engine
Define automatic triggers:
```
"if fieldX > 300 then label='spike'"
"if line contains 'ERR' then ignore"
"if regex matches /^SYS:/ then log only"
```

### 📈 Data Visualization
- Real-time line charts for numeric fields
- Smart sampling for performance optimization
- Toggle visibility per field
- Responsive chart design

### 📤 Template-Driven Export
- Custom CSV export templates: `${timestamp},${ax},${flag},${label}`
- Live preview before export
- Missing field warnings
- Configurable filename patterns

### 📝 Logging System
- Log levels: debug, info, warn, error
- TX/RX message filtering
- In-browser log viewer
- Downloadable log files

### ⚙️ Configuration Management
- JSON-based configuration
- Import/export config files
- Browser localStorage persistence
- Reset to defaults

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📸 Screenshots

### Light Mode
<div align="center">
  <img src="https://raw.githubusercontent.com/chater-marzougui/serial-data-collector/main/public/screenshots/main-light.png" alt="Light Mode" width="800">
</div>

### Dark Mode
<div align="center">
  <img src="https://raw.githubusercontent.com/chater-marzougui/serial-data-collector/main/public/screenshots/main-dark.png" alt="Dark Mode" width="800">
</div>

### Configuration Panel
<div align="center">
  <img src="https://raw.githubusercontent.com/chater-marzougui/serial-data-collector/main/public/screenshots/settings-dark.png" alt="Settings Panel" width="800">
</div>

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## ⚡ Getting Started

### Prerequisites
- **Browser**: Chrome, Edge, or Opera (Web Serial API support required)
- **Node.js**: 18+ (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/chater-marzougui/serial-data-collector.git

# Navigate to the project directory
cd serial-data-collector

# Install dependencies
npm install

# Start development server
npm run dev
```

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📚 Usage

1. **Configure your serial settings** (baud rate, delimiter, parser type) in the Settings menu
2. **Define your data fields** matching your device output
3. **Optionally configure class labels** for supervised learning datasets
4. **Connect your serial device** using the Connect button
5. **Start recording** — with or without labels
6. **Export your dataset** as CSV with your custom template

### Development Commands

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

### Deployment

#### GitHub Pages (Automatic)
Push to `main` branch triggers automatic deployment via GitHub Actions.

#### Manual Deployment
```bash
npm run build
# Upload contents of dist/ to your web server
```

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🪛 Configuration

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

| Parser | Use Case | Example Data |
|--------|----------|--------------|
| **Split** | CSV-like data | `1234567890,150,-200,980` |
| **Regex** | Complex patterns | `Sensor: ts=1234 ax=150 ay=-200` |
| **JSON** | Structured data | `{"timestamp":1234,"ax":150}` |

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

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📁 Project Structure

```
src/
├── core/                        # Core utilities
│   ├── SerialManager.ts         # Serial connection handling
│   ├── SerialWriter.ts          # Serial TX/command sending
│   ├── DataParser.ts            # Pluggable data parsing
│   ├── TemplateFormatter.ts     # CSV export formatting
│   ├── RulesEngine.ts           # Conditional trigger rules
│   ├── ConfigLoader.ts          # Configuration management
│   └── Logger.ts                # Logging system
├── components/                  # React UI components
│   ├── SerialConnection.tsx     # Connection controls
│   ├── SerialCommandPanel.tsx   # TX command interface
│   ├── LiveStream.tsx           # Real-time data display
│   ├── DataVisualization.tsx    # Charts and graphs
│   ├── RecordingPanel.tsx       # Recording controls
│   ├── StatsPanel.tsx           # Statistics display
│   ├── ConfigPanel.tsx          # Configuration UI
│   ├── ExportPanel.tsx          # Export controls
│   └── LoggerView.tsx           # Log viewer
├── context/                     # React context
│   └── AppContext.tsx           # Global state management
├── i18n/                        # Internationalization
│   └── locales/                 # Language files (en, fr, ar)
├── types/                       # TypeScript definitions
│   └── index.ts
└── App.tsx                      # Main application
```

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions are **greatly appreciated**.

### How to Contribute

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📃 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📧 Contact

**Chater Marzougui** - [@chater-marzougui](https://github.com/chater-marzougui) - chater.mrezgui2002@gmail.com

Project Link: [https://github.com/chater-marzougui/serial-data-collector](https://github.com/chater-marzougui/serial-data-collector)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts by [Recharts](https://recharts.org/)
- Icons by [Lucide](https://lucide.dev/)
- Internationalization with [i18next](https://www.i18next.com/)

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

Made with ❤️ for the maker community


[contributors-shield]: https://img.shields.io/github/contributors/chater-marzougui/serial-data-collector.svg?style=for-the-badge
[contributors-url]: https://github.com/chater-marzougui/serial-data-collector/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/chater-marzougui/serial-data-collector.svg?style=for-the-badge
[forks-url]: https://github.com/chater-marzougui/serial-data-collector/network/members
[stars-shield]: https://img.shields.io/github/stars/chater-marzougui/serial-data-collector.svg?style=for-the-badge
[stars-url]: https://github.com/chater-marzougui/serial-data-collector/stargazers
[issues-shield]: https://img.shields.io/github/issues/chater-marzougui/serial-data-collector.svg?style=for-the-badge
[issues-url]: https://github.com/chater-marzougui/serial-data-collector/issues
[license-shield]: https://img.shields.io/github/license/chater-marzougui/serial-data-collector.svg?style=for-the-badge
[license-url]: https://github.com/chater-marzougui/serial-data-collector/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/chater-marzougui-342125299/
