# ✅ Fixed: How to Start the Backend Server

## The Problem

The error occurred because Node.js was looking for `server.js` in the wrong directory:
- ❌ Looking for: `D:\Dsatm Hackathon\server.js` 
- ✅ Actual location: `D:\Dsatm Hackathon\dsatm\backend\server.js`

## ✅ Solution: Start from the Correct Directory

### Option 1: Use the Batch File (Easiest)

**Double-click this file:**
```
D:\Dsatm Hackathon\dsatm\backend\start-server.bat
```

This will automatically:
- Navigate to the correct directory
- Start the server
- Show you the output

### Option 2: Use PowerShell/Command Prompt

1. **Open a new terminal/PowerShell window**

2. **Navigate to the backend folder:**
   ```powershell
   cd "D:\Dsatm Hackathon\dsatm\backend"
   ```

3. **Start the server:**
   ```powershell
   npm start
   ```
   OR
   ```powershell
   node server.js
   ```

### Option 3: From Project Root

If you're in `D:\Dsatm Hackathon\`, use:
```powershell
cd dsatm\backend
npm start
```

## ✅ What You Should See

When the server starts successfully:

```
Connected to SQLite database
Subscriptions table ready
BrightWords Subscription API server running on port 3000
Health check: http://localhost:3000/api/health
```

## 🧪 Verify It's Running

Once you see the above message, open in your browser:
```
http://localhost:3000/api/health
```

You should see:
```json
{"status":"ok","message":"BrightWords Subscription API is running"}
```

## ⚠️ Important

- **Always run from**: `D:\Dsatm Hackathon\dsatm\backend\`
- **Keep the terminal window open** while the server is running
- **Press `Ctrl + C`** to stop the server

## 🎯 Quick Start Command

Copy and paste this entire command:

```powershell
cd "D:\Dsatm Hackathon\dsatm\backend"; npm start
```

---

**The server should now start successfully!** 🚀



