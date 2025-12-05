# 🔧 Troubleshooting: "Failed to Fetch" Error

## ✅ The Issue

If you see **"Failed to fetch"** when clicking on subscription plans, it means the frontend cannot connect to the backend server.

## 🚀 Quick Fix

### Step 1: Start the Backend Server

The backend server **must be running** for payments to work!

**Option A: Double-click batch file**
1. Go to: `D:\Dsatm Hackathon\dsatm\backend\`
2. Double-click: `start-server.bat`

**Option B: Use Terminal/PowerShell**
```powershell
cd "D:\Dsatm Hackathon\dsatm\backend"
npm start
```

### Step 2: Verify Server is Running

You should see:
```
Connected to SQLite database
Subscriptions table ready
BrightWords Subscription API server running on port 3000
Health check: http://localhost:3000/api/health
```

### Step 3: Test Backend Connection

Open in your browser:
```
http://localhost:3000/api/health
```

You should see:
```json
{"status":"ok","message":"BrightWords Subscription API is running"}
```

## ✅ Common Issues & Solutions

### Issue 1: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**: 
- Close any other applications using port 3000
- Or change the port in `backend/.env`: `PORT=3001`
- Update `subscription.html`: Change `API_BASE_URL` to match

### Issue 2: Backend Server Not Starting

**Error**: Module not found or other startup errors

**Solution**:
1. Make sure you're in the correct directory: `dsatm\backend\`
2. Install dependencies: `npm install`
3. Check `.env` file exists with Razorpay keys

### Issue 3: CORS Error

**Error**: CORS policy blocking requests

**Solution**: Already fixed! The backend now allows requests from:
- `http://localhost:8000`
- `http://localhost:9000`

### Issue 4: Database Error

**Error**: SQLite database errors

**Solution**: 
- The database will be auto-created on first run
- Make sure the `backend` folder has write permissions

## 🔍 Verify Everything is Working

### Checklist:

- [ ] Backend server is running (you see the startup messages)
- [ ] Health check works: http://localhost:3000/api/health
- [ ] Frontend is running on: http://localhost:8000
- [ ] You can see the subscription page
- [ ] Error messages now show helpful instructions

## 📝 Updated Error Messages

The subscription page now shows **helpful error messages** when the backend is not running:

```
❌ Backend Server Not Running!

The backend server is not running or not accessible.

To start it:
1. Open a terminal/PowerShell window
2. Navigate to: D:\Dsatm Hackathon\dsatm\backend
3. Run: npm start

Or double-click: start-server.bat in the backend folder

The server should run on http://localhost:3000
```

## 🎯 Quick Start Command

Copy and paste this in PowerShell:

```powershell
cd "D:\Dsatm Hackathon\dsatm\backend"; npm start
```

Keep the terminal window open while the server is running!

## 🆘 Still Not Working?

1. **Check browser console** (F12) for detailed errors
2. **Check backend terminal** for server errors
3. **Verify .env file** has correct Razorpay keys
4. **Try restarting** both frontend and backend

---

**Remember**: The backend server must be running for payments to work! 🚀



