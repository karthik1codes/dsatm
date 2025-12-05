# Quick Start: Subscription Setup (5 Minutes)

## 🚀 Fast Setup for Testing

### 1. Get Razorpay Test Keys (2 minutes)

1. Go to https://razorpay.com/ and sign up
2. Go to **Dashboard → Settings → API Keys**
3. Copy your **Test Key ID** (starts with `rzp_test_`)
4. Copy your **Test Key Secret**

### 2. Configure Backend (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your Razorpay keys
echo "RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID" > .env
echo "RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET" >> .env
echo "PORT=3000" >> .env

# Start server
npm start
```

Backend is now running on `http://localhost:3000`

### 3. Update Frontend (1 minute)

1. Open `subscription.html`
2. Find line: `const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';`
3. Replace with your Razorpay Test Key ID:
   ```javascript
   const RAZORPAY_KEY_ID = 'rzp_test_xxxxxxxxxxxxx';
   ```

### 4. Test Payment (1 minute)

1. Open your website
2. Click "🤟 Sign Language" in navigation
3. Click "View Plans & Subscribe"
4. Select a plan and pay
5. Use test card: `4111 1111 1111 1111` (any CVV, any expiry)
6. Enter OTP: `1234`

✅ **Done!** Your subscription system is working.

---

## 📝 Full Documentation

For detailed setup, troubleshooting, and production deployment:
👉 See `SUBSCRIPTION_SETUP.md`

---

## ⚡ What You Get

- ✅ Monthly plan: ₹299/month
- ✅ Yearly plan: ₹2,999/year (16% off)
- ✅ UPI, Cards, Wallets support
- ✅ Automatic subscription management
- ✅ Access control for sign language feature

---

## 🔧 Common Issues

**Backend won't start?**
- Check if port 3000 is free: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux)
- Change PORT in `.env` if needed

**Payment not working?**
- Verify Razorpay keys in `.env` and `subscription.html` match
- Check backend is running: http://localhost:3000/api/health

**Subscription not activating?**
- Check browser console for errors
- Check backend logs for payment verification errors
- Clear browser cache and localStorage

---

Need help? Check `SUBSCRIPTION_SETUP.md` for detailed troubleshooting!


