# ⚡ PRARUSH — Launch Kit & Developer Showcase

---

## 1. 📢 Ready-to-Post LinkedIn & X Launch Announcement

```markdown
🚀 Excited to introduce **Prarush** — A Universal Local-First Workspace for Software Engineers & Technical Creators! ⚡🧠

Most modern productivity tools force you into cloud lock-in, recurring monthly subscriptions, and opaque AI data routing. We built Prarush to give developers complete data sovereignty and seamless multi-model AI flexibility without sacrificing modern aesthetics or performance.

### 🌟 What Makes Prarush Different?

1. 🔒 **True Local-First Data Sovereignty:** 
Workspaces, Kanban sprint tasks, markdown documentation, and calendar events persist locally in browser storage and private IndexedDB (`prarush_files_db`) scoped per user profile. Zero telemetric snooping, zero vendor lock-in.

2. ⚡ **Direct BYOK Multi-Model AI Routing:** 
Connect your personal API keys directly from your browser to:
• Anthropic Messages API (Claude Sonnet 5.5, Sonnet 5 & Sonnet 4.5)
• OpenAI Chat Completions (GPT-4o Omni)
• Google Generative Language API (Gemini 3.8 Flash via secure header auth)
• Meta OpenRouter Gateway (Llama 3.3 70B)
• Prarush Local Engine (Deterministic offline rules when no cloud key is provided)
Keys default to session-only storage with 1-click purge.

3. 📦 **Authentic Binary File Persistence & GZIP Stream Engine:**
Upload real PDFs, images, and documents stored directly in IndexedDB. Run native browser `CompressionStream('gzip')` to generate downloadable `.gz` archives from real raw bytes.

4. 💾 **Complete Backup Archive (.ZIP) & GDPR Compliance:**
One-click full archive export bundling your structured `metadata.json` AND all binary files from IndexedDB. Dual-store factory reset that verifies IndexedDB clearance.

5. 🛠️ **13 High-Speed Modules in One Canvas:**
Workspaces (with 1-click "Clean Workspace" option), Kanban Sprint Boards, Markdown Knowledge Hub, Visual Content Studio, and a Global Command Center (`Ctrl+K`).

💻 GitHub Repository: https://github.com/Pratham4908/Prarush
⚡ Live Web App: https://prarush.vercel.app
📊 Interactive Pitch Deck: https://prarush.vercel.app/presentation.html

Tech Stack: React 19 • Vite • JSZip • Web Crypto API • IndexedDB • Native CompressionStream • Vanilla CSS Design System

#WebDevelopment #React #LocalFirst #AI #FullStack #SoftwareEngineering #OpenSource #Productivity #DeveloperTools #BuildInPublic
```

---

## 2. 🧪 Automated Test Verification

Prarush includes an automated unit & regression suite verifying all engines:

```bash
# Run 23 automated engine test suites
node src/test-prarush.js
```

**Key Verified Invariants:**
- Per-user data access isolation without cross-profile leakage.
- Direct AI model routing (Claude Sonnet 4.5, Gemini 3.8 Flash with header auth).
- Accurate labeling of offline fallbacks.
- Verified dual-store reset wiping both localStorage and IndexedDB.
- Binary file upload verification and error reporting.
- Prevention of fake placeholders on sample metadata records.
- Complete .ZIP archive bundling with JSZip.

---

## 3. 🌐 Vercel Deployment

Deployable as a high-performance static Vite bundle on Vercel:
- **Build Command:** `vite build`
- **Output Directory:** `dist`
- **Configuration:** [`vercel.json`](./vercel.json)
