// "use client";

// import { useEffect, useState } from "react";

// const LOCATION_STORAGE_KEY = "user_location";
// const LOCATION_EXPIRY_DAYS = 20;

// type LocationData = {
//   country: string;
//   city: string;
// };

// const getStoredLocation = (): LocationData | null => {
//   try {
//     const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
//     if (!storedData) return null;

//     const parsed = JSON.parse(storedData);
//     const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

//     const isExpired = Date.now() - parsed.timestamp > expiryTime;

//     return isExpired ? null : parsed.location;
//   } catch (err) {
//     console.error("Failed to parse location:", err);
//     return null;
//   }
// };

// const useLocationTracking = () => {
//   const [location, setLocation] = useState<LocationData | null>(
//     getStoredLocation()
//   );

//   useEffect(() => {
//     if (location) return;

//     fetch("https://ip-api.com/json/")
//       .then((res) => res.json())
//       .then((data) => {
//         const newLocation: LocationData = {
//           country: data.country,
//           city: data.city,
//         };

//         localStorage.setItem(
//           LOCATION_STORAGE_KEY,
//           JSON.stringify({
//             location: newLocation,
//             timestamp: Date.now(),
//           })
//         );

//         setLocation(newLocation);
//       })
//       .catch((error) => {
//         console.error("Failed to get location:", error);
//       });
//   }, []);

//   return location;
// };

// export default useLocationTracking;

"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

type LocationData = {
  country: string;
  city: string;
  region?: string;
  lat?: number;
  lon?: number;
};

type LocationState = {
  data: LocationData | null;
  loading: boolean;
  error: string | null;
};

type StoredLocationData = {
  location: LocationData;
  timestamp: number;
};

// Utility function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("localStorage getItem failed:", error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("localStorage setItem failed:", error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("localStorage removeItem failed:", error);
    }
  },
};

const getStoredLocation = (): LocationData | null => {
  try {
    const storedData = safeLocalStorage.getItem(LOCATION_STORAGE_KEY);
    if (!storedData) return null;

    const parsed: StoredLocationData = JSON.parse(storedData);

    // Validate the structure
    if (!parsed.location || !parsed.timestamp) {
      safeLocalStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsed.timestamp > expiryTime;

    if (isExpired) {
      safeLocalStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    return parsed.location;
  } catch (err) {
    console.error("Failed to parse stored location:", err);
    safeLocalStorage.removeItem(LOCATION_STORAGE_KEY);
    return null;
  }
};

const storeLocation = (location: LocationData): void => {
  try {
    const dataToStore: StoredLocationData = {
      location,
      timestamp: Date.now(),
    };

    safeLocalStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (err) {
    console.error("Failed to store location:", err);
  }
};

// Enhanced location API with fallbacks
const fetchLocationData = async (): Promise<LocationData> => {
  const apis = [
    {
      url: "https://ip-api.com/json/",
      parser: (data: any) => ({
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        region: data.regionName,
        lat: data.lat,
        lon: data.lon,
      }),
    },
    {
      url: "https://ipapi.co/json/",
      parser: (data: any) => ({
        country: data.country_name || "Unknown",
        city: data.city || "Unknown",
        region: data.region,
        lat: data.latitude,
        lon: data.longitude,
      }),
    },
    {
      url: "https://api.ipify.org?format=json",
      parser: async (data: any) => {
        // This API only returns IP, we'd need another call
        // For simplicity, returning basic data
        return {
          country: "Unknown",
          city: "Unknown",
        };
      },
    },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const location = await api.parser(data);

      // Validate that we got meaningful data
      if (location.country && location.country !== "Unknown") {
        return location;
      }
    } catch (error) {
      console.warn(`Location API ${api.url} failed:`, error);
      continue; // Try next API
    }
  }

  throw new Error("All location APIs failed");
};

const useLocationTracking = (options?: {
  skipIfExists?: boolean;
  onLocationUpdate?: (location: LocationData) => void;
  onError?: (error: string) => void;
}) => {
  const [state, setState] = useState<LocationState>(() => {
    const storedLocation = getStoredLocation();
    return {
      data: storedLocation,
      loading: !storedLocation,
      error: null,
    };
  });

  // Use ref to prevent effect from running multiple times
  const fetchAttempted = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const fetchLocation = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchAttempted.current) return;

    // Skip if we already have location and skipIfExists is true
    if (options?.skipIfExists && state.data) return;

    fetchAttempted.current = true;
    abortController.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const locationData = await fetchLocationData();

      // Check if component is still mounted
      if (abortController.current?.signal.aborted) return;

      storeLocation(locationData);
      setState({
        data: locationData,
        loading: false,
        error: null,
      });

      options?.onLocationUpdate?.(locationData);
    } catch (error) {
      if (abortController.current?.signal.aborted) return;

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch location";
      console.error("Location fetch failed:", errorMessage);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      options?.onError?.(errorMessage);
    }
  }, [state.data, options]);

  const refetchLocation = useCallback(() => {
    fetchAttempted.current = false;
    safeLocalStorage.removeItem(LOCATION_STORAGE_KEY);
    fetchLocation();
  }, [fetchLocation]);

  const clearLocation = useCallback(() => {
    safeLocalStorage.removeItem(LOCATION_STORAGE_KEY);
    setState({
      data: null,
      loading: false,
      error: null,
    });
    fetchAttempted.current = false;
  }, []);

  useEffect(() => {
    if (!state.data && !fetchAttempted.current) {
      fetchLocation();
    }

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchLocation, state.data]);

  // Auto-retry on network reconnection
  useEffect(() => {
    const handleOnline = () => {
      if (!state.data && state.error) {
        fetchAttempted.current = false;
        fetchLocation();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [state.data, state.error, fetchLocation]);

  return {
    location: state.data,
    loading: state.loading,
    error: state.error,
    refetchLocation,
    clearLocation,
    // Utility methods
    isLocationAvailable: !!state.data,
    isLocationExpired: () => {
      const stored = safeLocalStorage.getItem(LOCATION_STORAGE_KEY);
      if (!stored) return true;

      try {
        const parsed = JSON.parse(stored);
        const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        return Date.now() - parsed.timestamp > expiryTime;
      } catch {
        return true;
      }
    },
  };
};

export default useLocationTracking;
