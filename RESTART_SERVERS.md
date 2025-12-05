# 🔄 Server Restart Instructions

## ✅ Changes Applied & Servers Restarted

All fixes have been applied and servers have been restarted:

### **Fixes Applied:**
1. ✅ Fixed plan key mismatch (`individualMonthly` → `monthly`, etc.)
2. ✅ Improved Razorpay script loading with retry mechanism
3. ✅ Added comprehensive error logging
4. ✅ Fixed `calculateEndDate` to handle team plans
5. ✅ Updated CSP headers to allow Razorpay scripts

### **Servers Status:**
- ✅ Backend server: Running on `http://localhost:3000`
- ✅ Frontend server: Running on `http://localhost:8000`

## 🧪 Testing the Payment Gateway

1. **Open your browser** and go to: `http://localhost:8000/subscription`

2. **Clear browser cache** if needed:
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - Or press `Ctrl + F5` to hard refresh

3. **Select a plan** and click "Subscribe"

4. **Check browser console** (F12) for:
   - ✅ "Razorpay SDK loaded successfully"
   - ✅ "Creating order with payload..."
   - ✅ "Order created successfully"
   - ✅ "Opening Razorpay checkout..."

5. **Razorpay gateway should open** with test credentials:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - OTP: `1234`

## 🔧 Manual Restart (if needed)

### Backend Server:
```bash
cd "D:\Dsatm Hackathon\dsatm\backend"
npm start
```

### Frontend Server:
```bash
cd "D:\Dsatm Hackathon\dsatm"
npm run dev
```

## 🐛 Troubleshooting

If Razorpay still doesn't open:

1. **Check Browser Console (F12):**
   - Look for error messages
   - Check if `window.Razorpay` is defined: Type `window.Razorpay` in console

2. **Check Network Tab:**
   - Verify `/api/subscription/create-order` request succeeds
   - Check if Razorpay script loads from CDN

3. **Verify Backend is Running:**
   - Open: `http://localhost:3000/api/health`
   - Should return: `{"status":"ok","message":"BrightWords Subscription API is running"}`

4. **Hard Refresh Browser:**
   - Press `Ctrl + Shift + R` or `Ctrl + F5`
   - This clears cached JavaScript files

5. **Check Browser Extensions:**
   - Some ad blockers or privacy extensions may block Razorpay
   - Try disabling them temporarily

---

**All fixes applied and servers restarted! ✅**

