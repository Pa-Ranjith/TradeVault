# TradeVault Local Preview Guide 🚀

This guide provides the simplest steps to run the **TradeVault React/Next.js** environment on your local Windows machine. 

### 1. Prerequisites (Setup Once)
You need **Node.js** installed on your system.
- If you don't have it, download the "LTS" version from [nodejs.org](https://nodejs.org/).
- Open a terminal and type `node -v` to confirm it's working.

### 2. How to Start the App (The Routine)
Every time you want to see your changes live:

1. **Open your Terminal** (PowerShell or Command Prompt).
2. **Navigate to the Frontend folder**:
   ```powershell
   cd "d:\portfolio manager\tradevault latest\frontend"
   ```
3. **Install Dependencies** (Only needed the first time or if I add new features):
   ```powershell
   npm install
   ```
4. **Launch the Development Server**:
   ```powershell
   npm run dev
   ```
5. **Access the Preview**:
   Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

### 💡 Layman's Terms for Technical Jargons

*   **Node.js**: Think of this as the "engine" that allows your computer to run modern JavaScript applications outside of just a web browser.
*   **npm (Node Package Manager)**: A giant library of pre-written code (packages). `npm install` downloads all the specific "tools" TradeVault needs to run.
*   **Next.js**: The framework we are using. It's like a highly advanced template that handles speed, routing, and styling automatically.
*   **Development Server**: A private, local version of your website that only you can see. It automatically "refreshes" the page every time we save a file.
*   **Port 3000**: Like an apartment number in your computer. Your computer is the building (`localhost`), and we are running the app in room `3000`.

---

### Troubleshooting
- **Port 3000 is in use**: If you see an error saying the port is busy, you can run `npm run dev -- -p 3001` to use a different "room".
- **Module not found**: If the screen stays white, run `npm install` again to make sure all tools are properly downloaded.

> [!TIP]
> **Pro Tip**: I've already started this for you! You can view it right now at [http://localhost:3000](http://localhost:3000).
