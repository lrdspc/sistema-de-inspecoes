import { useState, useCallback, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  timestamp: number | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    timestamp: null,
  });

  const [watching, setWatching] = useState(false);

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      timestamp: position.timestamp,
    });
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error,
      timestamp: Date.now(),
    }));
  }, []);

  const getPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    const config = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 5000,
      maximumAge: options.maximumAge ?? 0,
    };

    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, config);
    });
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    const config = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 5000,
      maximumAge: options.maximumAge ?? 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      config
    );
    setWatching(true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  }, [
    options.enableHighAccuracy,
    options.timeout,
    options.maximumAge,
    onSuccess,
    onError,
  ]);

  useEffect(() => {
    if (options.watchPosition) {
      return startWatching();
    }
  }, [options.watchPosition, startWatching]);

  return {
    ...state,
    getPosition,
    startWatching,
    watching,
    isSupported: 'geolocation' in navigator,
  };
};
