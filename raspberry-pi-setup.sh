#!/bin/bash

# Raspberry Pi Kiosk Mode Setup for Dixon Dashboard
# Run this script on your Raspberry Pi to set up auto-launch in kiosk mode

echo "Setting up Dixon Dashboard Kiosk Mode..."

# Install required packages
sudo apt-get update
sudo apt-get install -y chromium-browser unclutter

# Create autostart directory if it doesn't exist
mkdir -p /home/pi/.config/autostart

# Create autostart entry for kiosk mode
cat > /home/pi/.config/autostart/dixon-dashboard.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Dixon Dashboard
Exec=/home/pi/start-dashboard.sh
Hidden=false
X-GNOME-Autostart-enabled=true
EOF

# Create the startup script
cat > /home/pi/start-dashboard.sh << 'EOF'
#!/bin/bash

# Wait for network connection
sleep 10

# Hide mouse cursor after 3 seconds of inactivity
unclutter -idle 3 &

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Start Chromium in kiosk mode
# Replace YOUR_VERCEL_URL with your actual Vercel deployment URL
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --check-for-update-interval=604800 \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --disable-translate \
  --no-first-run \
  --fast \
  --fast-start \
  --disable-features=TranslateUI \
  --disk-cache-dir=/tmp/chromium-cache \
  --password-store=basic \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --autoplay-policy=no-user-gesture-required \
  https://YOUR_VERCEL_URL/dashboard
EOF

# Make the startup script executable
chmod +x /home/pi/start-dashboard.sh

# Disable screen saver in lightdm config
sudo sh -c "echo '@xset s off' >> /etc/xdg/lxsession/LXDE-pi/autostart"
sudo sh -c "echo '@xset -dpms' >> /etc/xdg/lxsession/LXDE-pi/autostart"
sudo sh -c "echo '@xset s noblank' >> /etc/xdg/lxsession/LXDE-pi/autostart"

echo "Setup complete! Please:"
echo "1. Edit /home/pi/start-dashboard.sh and replace YOUR_VERCEL_URL with your actual URL"
echo "2. Reboot the Raspberry Pi to start in kiosk mode"
echo ""
echo "To exit kiosk mode: Press Alt+F4 or Ctrl+Alt+T for terminal"