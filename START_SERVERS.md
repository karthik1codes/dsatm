# 🚀 How to Start BrightWords Application

## Quick Start

### Option 1: Using Batch Files (Easiest)

1. **Start Backend Server:**
   - Navigate to `dsatm\backend\`
   - Double-click `start-server.bat`
   - OR run in terminal: `cd backend && start-server.bat`

2. **Start Frontend Server:**
   - Navigate to `dsatm\`
   - Open a new terminal/PowerShell window
   - Run: `npm run dev`
   - The app will open at `http://localhost:8000`

### Option 2: Manual Start

#### Terminal 1 - Backend Server
```bash
cd "d:\Dsatm Hackathon\dsatm\backend"
npm start
```
Backend runs on: `http://localhost:3000`

#### Terminal 2 - Frontend Server
```bash
cd "d:\Dsatm Hackathon\dsatm"
npm run dev
```
Frontend runs on: `http://localhost:8000`

## ⚙️ Backend Configuration

### Environment Variables

The backend needs a `.env` file in the `backend` folder. If it doesn't exist:

1. Copy `env.template` to `.env`:
   ```bash
   cd backend
   copy env.template .env
   ```

2. Edit `.env` and add your Razorpay keys:
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id_here
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
   PORT=3000
   NODE_ENV=development
   ```

### Install Backend Dependencies (if needed)
```bash
cd backend
npm install
```

## 🌐 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## ✅ Verification

### Check Backend is Running
- Visit: http://localhost:3000/api/health
- Should return: `{"status":"ok"}`

### Check Frontend is Running
- Visit: http://localhost:8000
- Should show the BrightWords login page

## 🐛 Troubleshooting

### Backend won't start
1. Check if port 3000 is already in use
2. Verify `.env` file exists in `backend` folder
3. Run `npm install` in `backend` folder
4. Check Node.js is installed: `node --version`

### Frontend won't start
1. Check if port 8000 is already in use
2. Run `npm install` in main `dsatm` folder
3. Check Node.js is installed: `node --version`

### Payment not working
1. Ensure backend is running on port 3000
2. Verify Razorpay keys in `.env` file
3. Check browser console for errors
4. Verify CORS is configured correctly

## 📝 Notes

- Backend must be running for subscription/payment features
- Frontend can run independently for basic features
- Both servers can run simultaneously on different ports
- Use separate terminal windows for each server

## 🎯 Quick Commands

**Start Backend:**
```bash
cd backend && npm start
```

**Start Frontend:**
```bash
npm run dev
```

**Start Both (Windows PowerShell):**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Dsatm Hackathon\dsatm\backend'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Dsatm Hackathon\dsatm'; npm run dev"
```

