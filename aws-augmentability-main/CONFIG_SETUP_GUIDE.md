# Configuration Setup Guide for config.js

This guide will help you fill in the AWS Cognito configuration values in `config.js`.

## Configuration Values Needed

You need to fill in **4 values** from AWS Cognito:

1. **IdentityPoolId** - Cognito Identity Pool ID
2. **region** - AWS Region (e.g., `eu-west-1`, `us-east-1`)
3. **userPoolId** - Cognito User Pool ID
4. **userPoolWebClientId** - Cognito User Pool App Client ID

---

## Step-by-Step Instructions

### Prerequisites
- AWS Account
- Access to AWS Console
- AWS Cognito services set up

---

### Option 1: If Using CloudFormation Template (Recommended)

If you deployed using the `template.yml` file:

1. **Go to AWS CloudFormation Console**
   - URL: https://console.aws.amazon.com/cloudformation/
   - Select your stack

2. **View Stack Outputs**
   - Click on the "Outputs" tab
   - You'll find:
     - `IdentityPoolId` - Copy this value
     - `UserPoolId` - Copy this value
     - `UserWebClientId` - Copy this value
     - `Region` - Copy this value

3. **Update config.js with these values**

---

### Option 2: Get Values from AWS Console Manually

#### Step 1: Get User Pool ID and Web Client ID

1. **Open AWS Cognito Console**
   - URL: https://console.aws.amazon.com/cognito/v2/idp/user-pools
   - Select your region (top right)

2. **Select Your User Pool**
   - Click on the user pool name
   - On the User Pool page, note the **User Pool ID** (format: `region_xxxxxxxxxx`)
     - Example: `eu-west-1_tnHx7mHay`

3. **Get App Client ID**
   - In the left sidebar, click **"App integration"** tab
   - Scroll down to **"App clients and analytics"** section
   - Click on your app client name
   - Copy the **Client ID** (format: long alphanumeric string)
     - Example: `56hp9p2g0mto0006dtg7vv5fac`

#### Step 2: Get Identity Pool ID

1. **Open AWS Cognito Federated Identities**
   - URL: https://console.aws.amazon.com/cognito/v2/identity/identity-pools
   - Select your region (top right)

2. **Select Your Identity Pool**
   - Click on the identity pool name
   - On the Identity Pool details page, you'll see the **Identity Pool ID**
     - Format: `region:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
     - Example: `eu-west-1:34657345-3456-3456-3456-345673456734`

#### Step 3: Get AWS Region

- Note which AWS region you're using
- Common regions:
  - `us-east-1` (N. Virginia)
  - `us-west-2` (Oregon)
  - `eu-west-1` (Ireland)
  - `ap-south-1` (Mumbai)
  - See all: https://docs.aws.amazon.com/general/latest/gr/rande.html

---

### Step 4: Update config.js File

Replace the placeholder values in `config.js`:

```javascript
var appConfig = {
    "IdentityPoolId": "YOUR_IDENTITY_POOL_ID_HERE"  // Format: region:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
}

var amplifyConfig = {
    "Auth": {
        "region": "YOUR_REGION_HERE",                    // e.g., "eu-west-1"
        "userPoolId": "YOUR_USER_POOL_ID_HERE",          // Format: region_xxxxxxxxxx
        "userPoolWebClientId": "YOUR_CLIENT_ID_HERE",    // Long alphanumeric string
        "mandatorySignIn": true,
        "cookieStorage": {
            "domain": window.location.hostname,
            "path": "/",
            "expires": 30,
            "secure": true
      }
    }
}
```

**Example:**
```javascript
var appConfig = {
    "IdentityPoolId": "eu-west-1:34657345-3456-3456-3456-345673456734"
}

var amplifyConfig = {
    "Auth": {
        "region": "eu-west-1",
        "userPoolId": "eu-west-1_tnHx7mHay",
        "userPoolWebClientId": "56hp9p2g0mto0006dtg7vv5fac",
        "mandatorySignIn": true,
        "cookieStorage": {
            "domain": window.location.hostname,
            "path": "/",
            "expires": 30,
            "secure": true
      }
    }
}
```

---

## Quick Reference: Where to Find Each Value

| Value | Where to Find | Format Example |
|-------|---------------|----------------|
| **IdentityPoolId** | Cognito → Identity Pools → Select Pool → Identity Pool ID | `eu-west-1:34657345-3456-3456-3456-345673456734` |
| **region** | Top right of AWS Console, or from User Pool ID | `eu-west-1`, `us-east-1` |
| **userPoolId** | Cognito → User Pools → Select Pool → User Pool ID | `eu-west-1_tnHx7mHay` |
| **userPoolWebClientId** | Cognito → User Pools → Select Pool → App integration → App clients → Client ID | `56hp9p2g0mto0006dtg7vv5fac` |

---

## Verification

After filling in the values:

1. Save the `config.js` file
2. Make sure all 4 values are filled correctly
3. Check that:
   - Region matches in all values (Identity Pool region should match User Pool region)
   - No extra spaces or quotes around values
   - Values are inside quotes (JSON format)

---

## Troubleshooting

**Error: "Invalid identity pool ID"**
- Check the Identity Pool ID format
- Ensure region prefix matches

**Error: "User pool not found"**
- Verify User Pool ID is correct
- Check region matches

**Error: "Invalid client ID"**
- Verify App Client ID from User Pool
- Ensure it's the web client (not server-side)

---

## Next Steps

After configuration:
1. Deploy your application
2. Test authentication flow
3. Verify users can sign in/up

