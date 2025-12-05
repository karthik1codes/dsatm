# Quick Setup: ngrok for Localhost HTTPS

## What is ngrok?

ngrok creates a secure HTTPS tunnel to your localhost, giving you a public HTTPS URL that points to your local development server.

## Quick Setup (Windows)

### Step 1: Download ngrok

1. Go to: https://ngrok.com/download
2. Download the Windows version (zip file)
3. Extract it to a folder (e.g., `C:\ngrok`)

### Step 2: Sign up (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up for free account
3. Get your authtoken from dashboard

### Step 3: Configure ngrok

1. Open Command Prompt or PowerShell
2. Run (replace with your authtoken):
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Step 4: Start Your Website

Start your website on port 8000:
```bash
npm run dev
# or
npm start
```

### Step 5: Create HTTPS Tunnel

In a **new** terminal window, run:
```bash
ngrok http 8000
```

You'll see output like:
```
Forwarding: https://abc123def456.ngrok.io -> http://localhost:8000
```

### Step 6: Use the HTTPS URL

Copy the HTTPS URL (the one starting with `https://`) and use it in Razorpay form:
```
https://abc123def456.ngrok.io
```

## Important Notes

- ⚠️ **URL changes**: Free ngrok URLs change each time you restart ngrok
- ✅ **Works for testing**: Perfect for Razorpay verification
- 💡 **Tip**: Keep ngrok running while testing

## For Permanent URL

If you need a permanent URL, consider:
- Netlify Drop (free, permanent HTTPS)
- Vercel (free, permanent HTTPS)
- Paid ngrok plan (custom domain)

---

**Next Step**: Use the HTTPS URL from ngrok in your Razorpay verification form! ✅


