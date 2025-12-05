# Razorpay Verification Guide - For Undeployed Websites

## Quick Answer

**For testing/development, use:**
- **Website link**: `http://localhost:8000`
- **Login required**: Select "Yes" (you have Google login)
- **Test account**: Use your test email/password

This works fine for Razorpay test mode! ✅

---

## Detailed Options

### Option 1: Use Localhost (Recommended for Testing)

If you're testing locally, you can use:

**Website Link:**
```
http://localhost:8000
```

**Why this works:**
- Razorpay allows localhost URLs for testing
- You can test payments in test mode
- Perfect for development

**In the form:**
- ✅ Website link: `http://localhost:8000`
- ✅ Login required: Yes (your site has Google login)
- ✅ Test account: Your test credentials

---

### Option 2: Quick Free Deployment (For Real URL)

If you want a real URL, you can deploy quickly for free:

#### Option 2a: GitHub Pages (Free, 5 minutes)

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select branch and folder
4. Get URL: `https://yourusername.github.io/repository-name`

#### Option 2b: Netlify Drop (Free, 2 minutes)

1. Go to https://app.netlify.com/drop
2. Drag and drop your `dsatm` folder
3. Get URL: `https://random-name-123.netlify.app`

#### Option 2c: Vercel (Free, 5 minutes)

1. Go to https://vercel.com
2. Import your project
3. Deploy
4. Get URL: `https://your-project.vercel.app`

**Use this URL in Razorpay verification form**

---

### Option 3: Use a Placeholder (Update Later)

You can also:

1. Use a placeholder URL like: `https://brightwords.com` (even if not deployed)
2. Submit the form to get your API keys
3. Update the URL later when you deploy

**Note**: Razorpay may verify the URL later, but you'll have keys to test with.

---

## What to Fill in the Form

Based on your setup:

| Field | Value |
|-------|-------|
| **Where to accept payments?** | Website ✅ |
| **Website link** | `http://localhost:8000` (or deployed URL) |
| **Login required?** | Yes ✅ (you have Google login) |
| **Test account email** | Your test email (e.g., `shashankva05@gmail.com`) |
| **Test account password** | Your test password |

---

## Important Notes

### For Testing (Test Mode)
- ✅ Localhost URLs work fine
- ✅ You can test payments immediately
- ✅ No real money involved

### For Production (Live Mode)
- ⚠️ You'll need a real domain (no localhost)
- ⚠️ Must complete KYC verification
- ⚠️ Must have HTTPS (SSL certificate)
- ⚠️ Real payments will be processed

---

## Recommended Steps

1. **For Now (Testing)**:
   - Use: `http://localhost:8000`
   - Select "Yes" for login
   - Submit form
   - Get test API keys
   - Start testing payments

2. **Later (Production)**:
   - Deploy your website to a free hosting service
   - Update Razorpay dashboard with new URL
   - Complete KYC verification
   - Switch to Live API keys

---

## Need Help?

- **Razorpay Support**: https://razorpay.com/support/
- **Quick deployment**: Check `QUICK_START_SUBSCRIPTION.md`

---

**Bottom Line**: Use `http://localhost:8000` for now, you can always update it later! 🚀


