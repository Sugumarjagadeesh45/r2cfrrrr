// src/utiliti/config.js
import { Platform } from 'react-native';

// Determine API URL based on environment and platform
const getApiUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Replace with your production backend URL
    return 'https://your-production-backend.com';
  }
  
  // For development:
  // - Android Emulator: use 'http://10.0.2.2:5000' (special alias for host loopback)
  // - Android Physical Device: use your PC's Wi-Fi IP address.
  // - iOS Simulator/Device: 'http://localhost:5000' or 'http://127.0.0.1:5000' works for simulator, PC's IP for physical device.
  
  if (Platform.OS === 'android') {
    // !!! IMPORTANT: Adjust this based on your Android environment !!!
    // If using an Android Emulator: Set to 'http://10.0.2.2:5000'
    // If using a Physical Android Device: Replace '10.136.59.126' with your PC's actual local IP address.
    // (You can find your PC's IP by running `ipconfig` on Windows or `ifconfig` on macOS/Linux).
    // Ensure your PC and device are on the same Wi-Fi network.
    return 'http://10.136.59.126:5000'; 
  }
  
  // For iOS (simulator or device)
  // For iOS Simulator: Usually 'http://localhost:5000' or 'http://127.0.0.1:5000' works.
  // For iOS Physical Device: Replace with your PC's actual local IP address.
  return 'http://localhost:5000';
};

export default getApiUrl();