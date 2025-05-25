import { useState, useEffect } from 'react';

interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}

export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function getDevices() {
      try {
        // Only request camera permission if not already granted
        const permissions = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        if (permissions.state === 'prompt') {
          await navigator.mediaDevices.getUserMedia({ video: true });
        }
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setDevices([]);
      }
    }

    getDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceList) => setDevices(deviceList))
        .catch(console.error);
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        handleDeviceChange
      );
    };
  }, []);

  return { devices };
}
