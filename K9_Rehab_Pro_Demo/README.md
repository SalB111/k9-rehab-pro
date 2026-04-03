# K9 Rehab Pro

K9 Rehab Pro is an ACVSMR-aligned veterinary rehabilitation intelligence platform for clinical decision support. It provides evidence-based protocol generation across four rehabilitation pathways (TPLO, IVDD, OA, Geriatric) with a validated 223-exercise library, phase-gated progression, and integrated clinical AI assistant.

---

## System Requirements

- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **RAM**: 8 GB minimum
- **Disk Space**: 200 MB
- **Browser**: Chrome, Edge, or Firefox (latest version)
- **Network**: No internet connection required for core functionality. B.E.A.U. clinical assistant requires an active internet connection and valid API key.

---

## How to Run

1. Double-click **K9RehabPro.exe**
2. A console window will appear showing server startup
3. Your default browser will automatically open to the application
4. If the browser does not open automatically, navigate to **http://localhost:3000**

To stop the application, close the console window.

---

## Folder Contents

| File / Folder | Purpose |
|---|---|
| `K9RehabPro.exe` | Application executable |
| `data/database.db` | Patient and exercise database |
| `public/` | Application interface files |
| `CanineRehabProtocols/` | Clinical source-of-truth documentation |
| `.env` | Configuration (API keys, if applicable) |

---

## Configuration

To enable the B.E.A.U. clinical assistant, edit the `.env` file and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your-key-here
```

All other features function without an API key.

---

## Support

For technical support or licensing inquiries, contact:

**Email**: support@k9rehabpro.com
**Web**: https://k9rehabpro.com

---

## Confidentiality Notice

This software and all accompanying materials are proprietary and confidential. Unauthorized copying, modification, distribution, reverse engineering, decompilation, or disassembly of this software is strictly prohibited. This software is licensed, not sold, and is provided for evaluation and authorized clinical use only. All rights reserved.
