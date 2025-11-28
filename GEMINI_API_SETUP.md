# Gemini API Setup Guide for Object Recognition

## Why These Errors Are Occurring

The errors you're seeing (`models/gemini-pro is not found for API version v1beta`) happen because:

1. **API Key Source Mismatch**: Your API key might be from Google AI Studio (makersuite.google.com) which uses a slightly different endpoint format than Google Cloud Platform keys.

2. **Model Name Variations**: Different API endpoints may use different model naming conventions:
   - `gemini-pro` vs `gemini-pro-vision`
   - `gemini-1.5-flash` vs `gemini-1.5-flash-latest`
   - Some models might only be available in v1, not v1beta

3. **API Version Differences**: The v1beta endpoint might not have all models that v1 has, or vice versa.

## What API Key You Need

### Option 1: Google AI Studio API Key (RECOMMENDED - FREE)
- **Where to get it**: https://makersuite.google.com/app/apikey
- **Cost**: FREE (with usage limits)
- **Best for**: Development and testing
- **How to get**:
  1. Go to https://makersuite.google.com/app/apikey
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the key (starts with `AIza...`)

### Option 2: Google Cloud Platform API Key
- **Where to get it**: https://console.cloud.google.com/
- **Cost**: Pay-as-you-go (free tier available)
- **Best for**: Production applications
- **How to get**:
  1. Go to https://console.cloud.google.com/
  2. Create a new project or select existing
  3. Enable "Generative Language API"
  4. Go to "APIs & Services" > "Credentials"
  5. Create API Key
  6. Restrict the key to "Generative Language API" for security

## What I Fixed

1. **Multiple Endpoint Support**: The code now tries:
   - `v1beta/models` endpoint
   - `v1/models` endpoint  
   - Different URL formats

2. **Multiple Model Names**: Tries these models in order:
   - `gemini-1.5-flash` (fastest, recommended)
   - `gemini-1.5-pro` (more accurate)
   - `gemini-pro-vision` (legacy vision model)
   - `gemini-pro` (basic model)

3. **Better Error Handling**: 
   - Lists available models if all attempts fail
   - Shows which endpoint/model combination worked
   - Provides clear error messages

4. **Automatic Detection**: The code automatically detects which endpoint format works with your API key

## Current API Key in Code

Your current API key: `AIzaSyCdz0O0nfPEaIHRNGvHUlBdBPOU4URqCFE`

This key is already configured in the code. If it's not working:

1. **Verify the key is valid**: Go to https://makersuite.google.com/app/apikey and check if the key exists
2. **Check API access**: Make sure the key has access to Gemini API
3. **Try creating a new key**: Sometimes keys get restricted or expire

## Testing

After the fix, when you upload an image:
1. The system will try multiple endpoints and models
2. Console will show which model/endpoint worked: `✅ Successfully used Gemini model: ...`
3. If all fail, it will show available models in the error message

## Next Steps

1. **Test the current fix**: Upload an image and check the browser console (F12)
2. **If still failing**: 
   - Check console for which models are available
   - Verify your API key at https://makersuite.google.com/app/apikey
   - Try creating a new API key
3. **If you need a different key**: Update `DEFAULT_GEMINI_KEY` in `main.js` line 108

## Troubleshooting

- **"API Key Error"**: Your key is invalid or doesn't have permissions
- **"Model not found"**: The model name doesn't exist for that endpoint (code will try others automatically)
- **"Quota exceeded"**: You've hit the free tier limit (wait or upgrade)

The code now handles all these cases automatically!

