# Dixon Priority Dashboard

Service Tech Priority Dashboard for Business Central Sales Orders

## Features

- Displays P2-P4 priority sales orders (P1s excluded)
- Auto-refreshes every 5 minutes
- Shows customer name, order number, delivery notes, and due dates
- Color-coded priority badges
- Responsive design optimized for displays

## Deployment

### Vercel Setup

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `BC_TENANT_ID`
   - `BC_CLIENT_ID`
   - `BC_CLIENT_SECRET`
   - `BC_ENVIRONMENT` (default: BC_Sandbox)

### Raspberry Pi Display Setup

1. Copy `raspberry-pi-setup.sh` to your Raspberry Pi
2. Run: `bash raspberry-pi-setup.sh`
3. Edit `/home/pi/start-dashboard.sh` and replace `YOUR_VERCEL_URL` with your actual Vercel URL
4. Reboot the Pi to start in kiosk mode

The dashboard will:
- Launch automatically on boot
- Run in full-screen kiosk mode
- Hide mouse cursor when idle
- Prevent screen blanking
- Auto-refresh every 5 minutes

### Chrome Extension (Optional)

For desktop monitoring, install the Chrome extension from `/chrome-extension` folder.

## API Endpoints

- `/api/sales-orders` - Fetches orders from Business Central
- `/api/warm-cache` - Keeps API warm (called by Vercel cron)

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000/dashboard