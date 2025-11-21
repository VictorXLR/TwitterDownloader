# Twitter API Setup Guide

This guide explains how to set up Twitter API credentials for the `@automaetopia` account to enable tweet posting and deletion features.

## Account Credentials

- **Username**: `automaetopia`
- **Password**: `atEnTIcKY`

## Getting Twitter API Credentials

Follow these steps to obtain the required API credentials:

### Step 1: Apply for Twitter Developer Access

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Log in using the account credentials above
3. If you haven't already, apply for a developer account:
   - Click "Sign up for Free Account"
   - Select "Hobbyist" or "Making a bot" as your use case
   - Provide a brief description of what you're building (e.g., "Personal automation tool for managing tweets")
   - Accept the terms and conditions
   - Verify your email address if prompted

### Step 2: Create a Twitter App

1. Once approved, go to the [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click on "Projects & Apps" in the left sidebar
3. Click "+ Create App" or "+ Add App"
4. Give your app a name (e.g., "TwitterDownloader Bot")
5. Click "Complete"

### Step 3: Get Your API Keys

1. After creating the app, you'll see the **API Key** and **API Secret Key**
   - **Save these immediately** - they won't be shown again!
   - These are your `TWITTER_API_KEY` and `TWITTER_API_SECRET`

2. Click on your app name to open the app settings
3. Go to the "Keys and tokens" tab
4. Under "Authentication Tokens", click "Generate" for Access Token and Secret
5. Save the **Access Token** and **Access Token Secret**
   - These are your `TWITTER_ACCESS_TOKEN` and `TWITTER_ACCESS_SECRET`

### Step 4: Set App Permissions

1. In your app settings, go to the "Settings" tab
2. Scroll down to "App permissions"
3. Click "Edit"
4. Select "Read and Write" permissions (required for posting and deleting tweets)
5. Save changes
6. **Important**: After changing permissions, you must regenerate your Access Token and Access Token Secret!
   - Go back to "Keys and tokens"
   - Click "Regenerate" under Access Token and Secret
   - Save the new tokens

### Step 5: Update the .env File

Update the `/home/user/TwitterDownloader/.env` file with your credentials:

```bash
# Twitter API Bearer Token (used for fetching tweets/videos)
TOKEN=YOUR_EXISTING_BEARER_TOKEN

# Twitter OAuth 1.0a credentials (required for posting and deleting tweets)
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here

# Account credentials (for reference)
TWITTER_USERNAME=automaetopia
TWITTER_PASSWORD=atEnTIcKY
```

## Available Features

Once configured, you can use the following endpoints and scripts:

### 1. POST /tweet - Post a New Tweet

```bash
curl -X POST http://localhost:3000/tweet \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from the API!"}'
```

Response:
```json
{
  "success": true,
  "tweet": {
    "id": "1234567890",
    "text": "Hello from the API!"
  }
}
```

### 2. DELETE /tweet/all - Delete All Tweets via API

```bash
curl -X DELETE http://localhost:3000/tweet/all
```

Response:
```json
{
  "success": true,
  "summary": {
    "deletedTweets": 150,
    "deletedRetweets": 45,
    "total": 195,
    "errors": 0
  }
}
```

### 3. Standalone Script - Delete All Tweets

Run the standalone script for a more detailed deletion process:

```bash
node src/deleteAllTweets.js
```

This script provides real-time progress updates and handles rate limiting automatically.

## Rate Limits

Twitter API has the following rate limits:

- **Delete Tweet**: 50 requests per 15 minutes
- **User Timeline**: 1,500 tweets per month (Free tier) or 100,000 tweets per month (Basic tier)

The scripts implement automatic retry logic and wait times to handle rate limits efficiently.

## Troubleshooting

### "403 Forbidden" Errors

- Check that your app has "Read and Write" permissions
- Regenerate your Access Token and Secret after changing permissions

### "401 Unauthorized" Errors

- Verify all credentials in `.env` are correct
- Ensure there are no extra spaces or quotes around the values

### Rate Limit Errors

- The scripts automatically handle rate limits by waiting
- You can also manually wait 15 minutes before retrying

## Security Notes

- **Never commit the `.env` file to version control** (it's already in `.gitignore`)
- Keep your API keys and tokens secure
- Regenerate tokens immediately if they are compromised
- Consider using environment variables in production instead of `.env` files
