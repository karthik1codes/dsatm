# Amazon Transcribe Integration Setup Guide

## Overview
This guide explains how Amazon Transcribe is integrated into the AWS AugmentAbility application and how to fix the "error streaming your audio to Amazon Transcribe" error.

## How Transcribe Works in This Application

The application uses Amazon Transcribe Streaming API to convert speech to text in real-time. Here's how it works:

1. **User clicks "Start" button** → Requests microphone access
2. **Audio is captured** → Browser's MediaDevices API captures audio stream
3. **Audio is processed** → Converted to PCM format and sent via WebSocket
4. **AWS Transcribe processes** → Receives audio and returns transcription in real-time
5. **Results displayed** → Transcribed text appears in the textarea

## Changes Made to Fix the Error

### 1. AWS Credentials Initialization
- **Problem**: When authentication was bypassed, AWS credentials weren't initialized, causing Transcribe to fail
- **Fix**: Added code to initialize unauthenticated Cognito Identity Pool credentials for AWS AugmentAbility pages
- **Location**: `lib/main.js` lines 60-84

### 2. Credential Validation Before Starting
- **Problem**: Transcribe would fail silently if credentials weren't ready
- **Fix**: Added credential check before starting transcription with clear error messages
- **Location**: `lib/main.js` lines 394-432

### 3. Enhanced Error Handling in WebSocket Setup
- **Problem**: Generic error messages made debugging difficult
- **Fix**: Added specific error checks for credentials, presigned URL creation, and WebSocket setup
- **Location**: `lib/main.js` lines 625-677

### 4. Presigned URL Validation
- **Problem**: Creating presigned URLs would fail if credentials weren't ready
- **Fix**: Added validation and error handling in `createPresignedUrl()` function
- **Location**: `lib/main.js` lines 1096-1153

## Required AWS Configuration

### Option 1: Enable Unauthenticated Access (Recommended for public accessibility)

1. **Go to AWS Cognito Console**
   - Navigate to: https://console.aws.amazon.com/cognito/v2/identity/identity-pools
   - Select your Identity Pool: `eu-west-1:3069f70c-3855-4393-b0eb-4d72d6d69af9`

2. **Enable Unauthenticated Access**
   - Click "Edit" on your Identity Pool
   - Check "Enable access to unauthenticated identities"
   - Save changes

3. **Configure Unauthenticated Role Permissions**
   - Go to IAM Console
   - Find the role created for unauthenticated identities (e.g., `Cognito_YourPoolNameUnauth_Role`)
   - Add these permissions:
     ```json
     {
       "Effect": "Allow",
       "Action": [
         "transcribe:StartStreamTranscription",
         "transcribe:StartStreamTranscriptionWebSocket"
       ],
       "Resource": "*"
     }
     ```

### Option 2: Require Authentication (More Secure)

If you prefer to require authentication:

1. Keep `mandatorySignIn: true` in `config.js`
2. Users must sign in before using Transcribe
3. Authenticated credentials will be used automatically

## Testing the Integration

1. **Rebuild the application**:
   ```bash
   cd aws-augmentability-main
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Test Transcribe**:
   - Navigate to `http://localhost:9000/aws-augmentability-main/f-hear-speak.html`
   - Click the "Start" button (microphone icon)
   - Allow microphone access when prompted
   - Speak into your microphone
   - You should see transcribed text appearing in real-time

## Troubleshooting

### Error: "AWS credentials not available"
- **Solution**: Ensure Cognito Identity Pool allows unauthenticated access OR sign in to the application

### Error: "Failed to create presigned URL"
- **Solution**: Check that your IAM role has Transcribe permissions (see Required AWS Configuration)

### Error: "Failed to get AWS credentials"
- **Solution**: Check your Identity Pool ID in `config.js` is correct
- Verify the Identity Pool exists in the correct AWS region

### Error: "WebSocket connection error"
- **Solution**: 
  - Check network connectivity
  - Verify AWS Transcribe service is available in your region (eu-west-1)
  - Check browser console for detailed error messages

### Microphone Not Working
- **Solution**: 
  - Check browser permissions for microphone access
  - Ensure HTTPS is used (required for microphone access in most browsers)
  - Try a different browser if issues persist

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Supported (may require HTTPS)
- **Mobile browsers**: Supported on iOS Safari and Chrome Android

## Security Notes

1. **Unauthenticated Access**: If enabled, anyone can use Transcribe services. Consider setting usage limits in AWS.

2. **IAM Permissions**: Use principle of least privilege - only grant necessary permissions.

3. **HTTPS Required**: Microphone access typically requires HTTPS in production.

## Additional Resources

- [Amazon Transcribe Streaming Documentation](https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html)
- [Cognito Identity Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html)
- [WebSocket API Reference](https://docs.aws.amazon.com/transcribe/latest/dg/websocket.html)

