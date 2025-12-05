# 🚀 Starting the Backend Server

## Quick Start

The backend server has been configured and is ready to run!

## Start the Server

### Option 1: Using npm (Recommended)

Open a **new terminal/PowerShell window** and run:

```bash
cd "D:\Dsatm Hackathon\dsatm\backend"
npm start
```

### Option 2: Using the Batch File

Double-click `start-server.bat` in the `backend` folder.

### Option 3: Direct Node Command

```bash
cd "D:\Dsatm Hackathon\dsatm\backend"
node server.js
```

## ✅ What You Should See

When the server starts successfully, you'll see:

```
Connected to SQLite database
Subscriptions table ready
BrightWords Subscription API server running on port 3000
Health check: http://localhost:3000/api/health
```

## 🧪 Test the Server

Once you see the above message, open in your browser:

**http://localhost:3000/api/health**

You should see:
```json
{"status":"ok","message":"BrightWords Subscription API is running"}
```

## ⚠️ Important Notes

1. **Keep the terminal open** - The server runs in that window
2. **Port 3000** - Make sure nothing else is using port 3000
3. **Database** - SQLite database will be auto-created on first run

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal where the server is running.

## 📝 Configuration

- **Razorpay Key ID**: `rzp_test_Rneu0aaeOPlIHD` ✅
- **Port**: `3000` ✅
- **Environment**: Development ✅

---

**Ready!** Start the server and test your payment system! 🎉


