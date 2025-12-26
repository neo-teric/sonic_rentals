# Ngrok Setup for Internet Access

This guide will help you expose your local Next.js server to the internet using ngrok.

## Quick Start

1. **Get your ngrok auth token** (free):
   - Sign up at https://dashboard.ngrok.com/signup
   - Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

2. **Authenticate ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
   ```

3. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

4. **Access your site**:
   - ngrok will display a public URL like: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
   - Use this URL to access your site from anywhere on the internet

## Alternative: Use ngrok without account (limited)

If you just want to test quickly, you can run:
```bash
ngrok http 3000 --log=stdout
```

Note: Without an account, sessions are limited to 2 hours and you'll need to click through a warning page.

## Running ngrok in background

To run ngrok in the background:
```bash
ngrok http 3000 > /dev/null 2>&1 &
```

Then check the public URL:
```bash
curl http://localhost:4040/api/tunnels | python3 -m json.tool
```

## Important Notes

- The ngrok URL changes each time you restart (unless you have a paid plan with static domains)
- Make sure your Next.js server is running on port 3000 before starting ngrok
- The public URL will forward all traffic to your local server
- For production use, consider using a proper hosting service instead

## Stopping ngrok

```bash
pkill ngrok
```

