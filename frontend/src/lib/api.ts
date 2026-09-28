import axios from 'axios';
import { Capacitor } from '@capacitor/core';

let defaultBaseUrl = 'http://localhost:4000/api';

// Dynamically handle local network IPs for mobile emulators and physical devices
if (typeof window !== 'undefined') {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    // Android Studio Emulator alias to host machine localhost
    defaultBaseUrl = 'http://10.0.2.2:4000/api';
  } else if (window.location.hostname && window.location.hostname !== 'localhost' && !platform) {
    // If accessed via local network IP on web
    defaultBaseUrl = `http://${window.location.hostname}:4000/api`;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
