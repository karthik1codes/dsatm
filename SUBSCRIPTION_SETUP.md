# Sign Language Subscription Setup Guide

This guide will help you set up the subscription system for the Sign Language feature with UPI payment support.

## Overview

The subscription system includes:
- Monthly plan: ₹299/month
- Yearly plan: ₹2,999/year (16% discount)
- UPI, Cards, Wallets, Netbanking payment options via Razorpay
- Automatic subscription verification and access control

## Step-by-Step Setup

### Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://razorpay.com/)
2. Sign up for a free account
3. Complete KYC verification (required for live payments)
4. Navigate to **Settings → API Keys**
5. Copy your **Key ID** and **Key Secret**

   - For testing: Use "Test" keys (start with `rzp_test_`)
   - For production: Use "Live" keys (start with `rzp_live_`)

### Step 2: Set Up Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   - Create a file named `.env` in the `backend` folder
   - Copy the contents from `env.template`
   - Add your Razorpay credentials:

   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_key_secret_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the backend server:**
   ```bash
   # Development mode (auto-reload)
   npm run dev

   # Or production mode
   npm start
   ```

   The server will run on `http://localhost:3000`

### Step 3: Update Frontend Configuration

1. **Open `subscription.html`:**
   - Find this line (around line 88):
     ```javascript
     const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';
     ```
   - Replace `YOUR_RAZORPAY_KEY_ID` with your actual Razorpay Key ID
   - Example:
     ```javascript
     const RAZORPAY_KEY_ID = 'rzp_test_xxxxxxxxxxxxx';
     ```

2. **Verify API URL:**
   - The default API URL is `http://localhost:3000/api`
   - If your backend runs on a different port or domain, update it:
     ```javascript
     const API_BASE_URL = 'http://your-domain.com/api';
     ```

### Step 4: Test the Setup

1. **Start the backend server** (if not already running)
2. **Open your website** in a browser
3. **Navigate to Sign Language page** - You should see the subscription modal
4. **Click "View Plans & Subscribe"**
5. **Select a plan** and click subscribe
6. **Use Razorpay test credentials:**
   - **Test Card**: `4111 1111 1111 1111` (any CVV, any expiry)
   - **Test UPI ID**: Any valid UPI ID format works in test mode
   - **OTP**: `1234` (for 3D Secure)

### Step 5: Access Control Flow

The subscription system works as follows:

1. **User clicks "Sign Language" link** → Redirects to `sign-language.html`
2. **Page checks subscription status** in localStorage
3. **If no active subscription:**
   - Shows subscription modal
   - User clicks "View Plans & Subscribe"
   - Redirects to `subscription.html`
4. **User selects plan and pays:**
   - Payment processed via Razorpay
   - Backend verifies payment
   - Subscription saved to database and localStorage
5. **After successful payment:**
   - User redirected to `sign-language.html`
   - Subscription check passes
   - Sign language feature loads

## File Structure

```
dsatm/
├── subscription.html          # Subscription page with payment UI
├── sign-language.html         # Sign language feature (with subscription check)
├── backend/
│   ├── server.js              # Express API server
│   ├── package.json           # Backend dependencies
│   ├── env.template           # Environment variables template
│   ├── subscriptions.db       # SQLite database (auto-created)
│   └── README.md              # Backend documentation
└── SUBSCRIPTION_SETUP.md      # This file
```

## Payment Methods Supported

Razorpay supports:
- ✅ **UPI** (PhonePe, Google Pay, Paytm, BHIM, etc.)
- ✅ **Credit/Debit Cards** (Visa, Mastercard, RuPay, Amex)
- ✅ **Wallets** (Paytm, Freecharge, Mobikwik)
- ✅ **Netbanking** (All major banks)
- ✅ **EMI** (Available for cards)

## Pricing Configuration

Current pricing (can be changed in `backend/server.js`):

```javascript
const PLANS = {
    monthly: {
        name: 'Monthly Plan',
        amount: 29900,  // ₹299 (amount in paise)
        duration: 'monthly',
        days: 30
    },
    yearly: {
        name: 'Yearly Plan',
        amount: 299900, // ₹2,999 (amount in paise)
        duration: 'yearly',
        days: 365
    }
};
```

To change pricing, update the `amount` values (remember: amounts are in paise, so ₹299 = 29900 paise).

## Production Deployment

### Backend Deployment

1. **Choose a hosting platform:**
   - Heroku, Railway, Render, AWS, DigitalOcean, etc.
2. **Set environment variables** on the platform:
   - `RAZORPAY_KEY_ID` (use LIVE keys)
   - `RAZORPAY_KEY_SECRET` (use LIVE keys)
   - `PORT` (usually auto-set by platform)
   - `NODE_ENV=production`
3. **Update database** (for production, consider PostgreSQL/MySQL instead of SQLite)
4. **Update CORS settings** in `server.js` to allow your domain only

### Frontend Updates

1. **Update `subscription.html`:**
   - Change `RAZORPAY_KEY_ID` to your LIVE key
   - Update `API_BASE_URL` to your production backend URL
2. **Deploy frontend** to your hosting platform

## Security Best Practices

1. ✅ **Never commit `.env` file** - Contains sensitive credentials
2. ✅ **Use HTTPS in production** - Required for secure payments
3. ✅ **Verify payment signatures** - Already implemented in backend
4. ✅ **Store credentials securely** - Use environment variables
5. ✅ **Enable CORS properly** - Restrict to your domain in production
6. ✅ **Use Razorpay webhooks** - For additional payment verification (optional)

## Troubleshooting

### Payment not working?

1. **Check Razorpay keys** are correct in `.env` and `subscription.html`
2. **Verify backend server** is running on correct port
3. **Check browser console** for JavaScript errors
4. **Check backend logs** for API errors
5. **Ensure CORS** is enabled if frontend and backend are on different domains

### Subscription not activating?

1. **Check payment verification** in backend logs
2. **Verify database** is created and writable
3. **Check localStorage** for subscription data after payment
4. **Clear browser cache** and try again

### Backend server won't start?

1. **Check Node.js version** (requires Node.js 14+)
2. **Verify all dependencies** are installed (`npm install`)
3. **Check port 3000** is not already in use
4. **Verify environment variables** are set correctly

## Additional Features (Optional)

You can extend the system with:

- **Email notifications** after successful payment
- **Subscription renewal** reminders
- **Cancel subscription** functionality
- **Refund handling** via Razorpay
- **Subscription management** dashboard for users
- **Webhook integration** for real-time payment updates

## Support

For issues related to:
- **Razorpay integration**: [Razorpay Docs](https://razorpay.com/docs/)
- **Payment problems**: Check Razorpay Dashboard → Payments
- **API issues**: Check backend server logs
- **Frontend issues**: Check browser console

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Razorpay test keys are configured
- [ ] Subscription page loads correctly
- [ ] Payment modal opens when clicking subscribe
- [ ] Test payment succeeds
- [ ] Subscription activates after payment
- [ ] Sign language feature unlocks after subscription
- [ ] Subscription check works on page reload

---

**Note**: Always test thoroughly with Razorpay test keys before switching to live keys in production!


