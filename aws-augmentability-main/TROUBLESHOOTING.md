# Troubleshooting Guide - Sign-In Issues

## Issues Fixed

### 1. **Sign-In Promise Not Handled Properly** ✅ FIXED
**Problem:** The original code didn't properly wait for the sign-in to complete before reloading the page.

**Fix:** Updated the sign-in function to properly handle the Promise with `.then()` and `.catch()`.

### 2. **Cookie Storage Secure Setting** ✅ FIXED
**Problem:** `secure: true` in cookieStorage prevents cookies from working on localhost (HTTP).

**Fix:** Changed to only use secure cookies when using HTTPS:
```javascript
"secure": window.location.protocol === "https:"
```

---

## Common Issues After Sign-In

### Issue 1: "Error signing in" or Authentication Fails

**Possible Causes:**
1. **Incorrect config.js values**
   - Check that all 4 values in `config.js` match your AWS Cognito setup
   - Verify IdentityPoolId, UserPoolId, and UserPoolWebClientId are correct

2. **User doesn't exist or password is wrong**
   - Verify username and password
   - Check if user was created in Cognito User Pool

3. **User needs to change temporary password**
   - If using a temporary password, you must change it first
   - Use the UserPoolLoginUrl from CloudFormation outputs

**Solution:**
- Open browser console (F12) and check for error messages
- Verify config.js values match your AWS Cognito resources

---

### Issue 2: Sign-In Succeeds but Page Doesn't Redirect

**Possible Causes:**
1. **JavaScript errors in console**
2. **index-landing.html not found**
3. **Cognito Identity Pool credentials issue**

**Solution:**
1. Open browser console (F12 → Console tab)
2. Check for red error messages
3. Verify `index-landing.html` exists in the same directory

---

### Issue 3: "Not authorized" or Credentials Error

**Possible Causes:**
1. **Identity Pool not configured correctly**
   - Identity Pool must be linked to the User Pool
   - IAM roles must be properly configured

2. **Region mismatch**
   - All values in config.js must use the same AWS region

**Solution:**
- Verify Identity Pool has Cognito Identity Provider linked to your User Pool
- Check IAM roles are attached to the Identity Pool
- Ensure all config values use the same region

---

### Issue 4: Cookies Not Working on Localhost

**Status:** ✅ FIXED - The code now automatically handles HTTP vs HTTPS

**Manual Fix (if needed):**
In `config.js`, change:
```javascript
"secure": true
```
To:
```javascript
"secure": window.location.protocol === "https:"
```

---

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser (Chrome/Firefox/Edge)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try signing in and watch for errors
5. Look for messages in red

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try signing in
3. Look for failed requests (red status codes)
4. Check if requests to Cognito are successful

### Step 3: Verify Config.js Values
Open `config.js` and verify:
- ✅ IdentityPoolId format: `region:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- ✅ userPoolId format: `region_xxxxxxxxxx`
- ✅ userPoolWebClientId: long alphanumeric string
- ✅ region: matches in all values

### Step 4: Test Cognito Configuration
1. Go to AWS Cognito Console
2. Verify User Pool exists and is active
3. Verify Identity Pool exists and is linked to User Pool
4. Check that user exists in User Pool

---

## Quick Checklist

Before reporting issues, verify:

- [ ] `config.js` has correct values (not placeholders)
- [ ] All config values use the same AWS region
- [ ] User exists in Cognito User Pool
- [ ] Password is correct (or temporary password was changed)
- [ ] Browser console shows no JavaScript errors
- [ ] Identity Pool is linked to User Pool
- [ ] IAM roles are attached to Identity Pool
- [ ] Built the project: `npm run build` (after code changes)

---

## Rebuild After Changes

If you modify `lib/main.js` or `config.js`, you need to rebuild:

```cmd
cd aws-augmentability-main
npm run build
```

Then restart the web server:

```cmd
npm start
```

---

## Need More Help?

1. Check browser console for specific error messages
2. Verify all config.js values are correct
3. Ensure AWS Cognito resources are properly set up
4. Check that you've changed your temporary password (if applicable)

