FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    DISPLAY=:99 \
    VNC_PORT=5900 \
    NOVNC_PORT=6080

# Install dependencies
RUN apt-get update && apt-get install -y \
    x11vnc \
    xvfb \
    novnc \
    curl \
    sudo \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libnspr4 \
    libnss3 \
    lsb-release \
    xdg-utils \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    libxshmfence1 \
    libx11-xcb-dev \
    && apt-get clean

# Install latest Node.js (LTS) from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Verify Node.js and npm versions
RUN node -v && npm -v

# Install Chromium manually
RUN apt-get update && apt-get install curl gnupg -y \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install google-chrome-stable -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Install Node.js packages
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Start Xvfb, VNC, and Puppeteer script
CMD Xvfb :99 -screen 0 1920x1080x24 & \
    sleep 2 && \
    export DISPLAY=:99 && \
    x11vnc -display :99 -forever -nopw -listen 0.0.0.0 -rfbport 5900 -noipv6 & \
    node index.js




