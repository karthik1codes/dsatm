# Razorpay Test Keys Setup ✅

Your Razorpay test keys have been configured! Here's what's been set up:

## ✅ What's Configured

### Frontend (`subscription.html`)
- ✅ Razorpay Key ID: `rzp_test_Rneu0aaeOPlIHD`
- ✅ API URL: `http://localhost:3000/api`

### Backend Setup

You need to create the `.env` file in the `backend` folder:

## 🔧 Quick Setup Steps

### Option 1: Use Setup Script (Easiest)

```bash
cd backend
node setup-env.js
```

This will automatically create the `.env` file with your keys.

### Option 2: Create .env File Manually

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create `.env` file** with this content:

   ```env
   # Razorpay Configuration - Test Keys
   RAZORPAY_KEY_ID=rzp_test_Rneu0aaeOPlIHD
   RAZORPAY_KEY_SECRET=HK5dMB6B2Y4HLFdInB6FVbw3

   # Server Configuration
   PORT=3000

   # Environment
   NODE_ENV=development
   ```

3. **Save the file** as `.env` (make sure it's exactly `.env`, not `.env.txt`)

## 🚀 Next Steps

1. **Install backend dependencies** (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```

   You should see:
   ```
   BrightWords Subscription API server running on port 3000
   Health check: http://localhost:3000/api/health
   ```

3. **Test the setup:**
   - Open: http://localhost:3000/api/health
   - You should see: `{"status":"ok","message":"BrightWords Subscription API is running"}`

## ✅ Configuration Summary

| Component | Status | Key |
|-----------|--------|-----|
| Frontend | ✅ Configured | `rzp_test_Rneu0aaeOPlIHD` |
| Backend | ⚠️ Need .env file | Create `.env` with keys above |

## 🧪 Testing Payments

Once the backend is running:

1. **Open your website**
2. **Navigate to Sign Language page**
3. **Click "View Plans & Subscribe"**
4. **Select a plan** (Monthly or Yearly)
5. **Test payment** with Razorpay test credentials:
   - **Card**: `4111 1111 1111 1111` (any CVV, any expiry)
   - **UPI**: Any valid UPI ID works in test mode
   - **OTP**: `1234` (for 3D Secure)

## 🔐 Security Note

- ✅ These are **test keys** - no real money involved
- ✅ `.env` file is in `.gitignore` - won't be committed to git
- ⚠️ **Never commit** your keys to public repositories
- ⚠️ For production, use **Live Keys** from Razorpay dashboard

## 📝 Your Test Keys

```
Key ID:     rzp_test_Rneu0aaeOPlIHD
Key Secret: HK5dMB6B2Y4HLFdInB6FVbw3
```

---

**Ready to test!** Start the backend server and try a payment! 🚀



