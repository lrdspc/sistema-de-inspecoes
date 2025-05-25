import { useState, useEffect } from 'react';
import { useToast } from './useToast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseMapResult {
  currentLocation: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  getUserLocation: () => Promise<void>;
  calculateDistance: (point1: Coordinates, point2: Coordinates) => number;
  getAddressFromCoordinates: (coords: Coordinates) => Promise<string>;
}

export function useMap(): UseMapResult {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setError('Erro ao obter localização');
      addToast({
        title: 'Erro de Localização',
        message: 'Não foi possível obter sua localização atual',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (
    point1: Coordinates,
    point2: Coordinates
  ): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getAddressFromCoordinates = async (
    coords: Coordinates
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
      );
      const data = await response.json();
      return data.display_name;
    } catch (err) {
      console.error('Erro ao obter endereço:', err);
      return 'Endereço não encontrado';
    }
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  return {
    currentLocation,
    isLoading,
    error,
    getUserLocation,
    calculateDistance,
    getAddressFromCoordinates,
  };
}
