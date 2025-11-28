# How to Set Password for Users in AWS Cognito

## Method 1: Set Password via AWS Console (Recommended)

### Step-by-Step Instructions:

1. **Open AWS Cognito Console**
   - Go to: https://console.aws.amazon.com/cognito/v2/idp/user-pools
   - Select your AWS region (top right corner)

2. **Select Your User Pool**
   - Click on your user pool name (e.g., "augmentability-user-pool")

3. **Go to Users Tab**
   - In the left sidebar, click **"Users"**

4. **Select the User**
   - Find and click on the username you want to set a password for

5. **Set Password**
   - Click the **"Actions"** button (top right)
   - Select **"Set password"** from the dropdown menu
   - Enter the new password in the dialog
   - Choose one of the options:
     - **"Temporary password"** - User will be forced to change password on next login
     - **"Permanent password"** - Password is permanent, no change required
   - Click **"Set password"**

6. **If Using Temporary Password**
   - User will receive an email with the temporary password
   - User must change password on first login

---

## Method 2: Send Password Reset Email

1. **Open AWS Cognito Console**
   - Go to: https://console.aws.amazon.com/cognito/v2/idp/user-pools

2. **Select Your User Pool → Users → Select User**

3. **Send Password Reset**
   - Click **"Actions"** button
   - Select **"Send password reset email"**
   - User will receive an email with password reset link

---

## Method 3: Create New User with Password

### Via AWS Console:

1. **Open AWS Cognito Console → Your User Pool → Users**

2. **Create User**
   - Click **"Create user"** button
   - Fill in:
     - **Username** (required)
     - **Email** (required, must be verified)
     - **Temporary password** (required)
     - **Mark phone number as verified** (if applicable)
     - **Send an invitation to new user** (optional - sends email)

3. **Set Password Options**
   - **Temporary password**: User must change on first login
   - **Send invite email**: Sends invitation with temporary password

4. **Click "Create user"**

---

## Method 4: Using AWS CLI

### Set Password for Existing User:

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id YOUR_USER_POOL_ID \
  --username USERNAME \
  --password PASSWORD \
  --permanent
```

**Options:**
- `--permanent`: Password is permanent (no change required)
- Remove `--permanent`: Password is temporary (must change on login)

### Example:
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id eu-west-1_tnHx7mHay \
  --username myuser \
  --password MySecurePass123! \
  --permanent
```

### Send Password Reset Email:

```bash
aws cognito-idp admin-reset-user-password \
  --user-pool-id YOUR_USER_POOL_ID \
  --username USERNAME
```

---

## Method 5: Create User with Password via AWS CLI

```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username USERNAME \
  --user-attributes Name=email,Value=user@example.com \
  --temporary-password TEMP_PASSWORD \
  --message-action SUPPRESS
```

Then set permanent password:
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id YOUR_USER_POOL_ID \
  --username USERNAME \
  --password PERMANENT_PASSWORD \
  --permanent
```

---

## Quick Reference

### Via AWS Console:
1. Cognito → User Pools → Select Pool → Users → Select User
2. Actions → "Set password" or "Send password reset email"

### Via AWS CLI:
```bash
# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id YOUR_POOL_ID \
  --username USERNAME \
  --password PASSWORD \
  --permanent

# Send password reset email
aws cognito-idp admin-reset-user-password \
  --user-pool-id YOUR_POOL_ID \
  --username USERNAME
```

---

## Password Requirements

Your Cognito User Pool has password policies. Check them in:
- Cognito Console → User Pool → Sign-in experience → Password policy

Common requirements:
- Minimum length (usually 8 characters)
- Requires uppercase letters
- Requires lowercase letters
- Requires numbers
- Requires special characters

---

## Troubleshooting

**"Password does not meet requirements"**
- Check password policy in User Pool settings
- Ensure password meets all requirements

**"User not found"**
- Verify username is correct
- Check you're in the right User Pool

**"Email not verified"**
- User must verify email before password reset emails work
- Verify email in User Pool settings

---

## For Multiple Users

### Bulk Create Users:

Use AWS CLI script or AWS SDK to create multiple users:

```bash
# Example for multiple users
for user in user1 user2 user3; do
  aws cognito-idp admin-create-user \
    --user-pool-id YOUR_POOL_ID \
    --username $user \
    --user-attributes Name=email,Value=${user}@example.com \
    --temporary-password TempPass123! \
    --message-action SUPPRESS
done
```

---

## Important Notes

1. **Temporary Passwords**: User must change on first login
2. **Permanent Passwords**: User can use immediately
3. **Email Verification**: May be required depending on User Pool settings
4. **Password Policy**: Must meet User Pool password requirements

