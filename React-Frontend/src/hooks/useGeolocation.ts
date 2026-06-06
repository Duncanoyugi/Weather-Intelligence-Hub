import { useEffect, useState } from 'react';

interface LocationData {
  lat: number | null;
  lon: number | null;
  error: string | null;
  loading: boolean;
  permissionAsked: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData>({
    lat: null,
    lon: null,
    error: null,
    loading: true,
    permissionAsked: false,
  });

  const askForLocation = () => {
    if (typeof window === 'undefined') return;

    setLocation((prev) => ({
      ...prev,
      loading: true,
      permissionAsked: true,
      error: null,
    }));

    if (!navigator.geolocation) {
      setLocation({
        lat: null,
        lon: null,
        error: 'Your browser does not support geolocation',
        loading: false,
        permissionAsked: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          error: null,
          loading: false,
          permissionAsked: true,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location. Please search manually.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location access denied. Please allow location access to see your local weather.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please search manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please search manually.';
        }

        setLocation({
          lat: null,
          lon: null,
          error: errorMessage,
          loading: false,
          permissionAsked: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    askForLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...location, askForLocation };
};

