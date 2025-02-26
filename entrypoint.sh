#!/bin/bash

# Start X virtual framebuffer
Xvfb :98 -screen 0 1024x768x24 +extension GLX +render -noreset 2>/dev/null &

# Export the display
export DISPLAY=:98

# Wait for Xvfb to fully initialize
sleep 5

# Ensure VNC password is stored correctly
chmod 600 ~/.vnc/passwd

# Start the Node.js application
exec node index.js &

# Start the VNC server
x11vnc -forever -usepw -create -display :98


