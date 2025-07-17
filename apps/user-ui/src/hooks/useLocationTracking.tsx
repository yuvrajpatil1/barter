"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

type LocationData = {
  country: string;
  city: string;
};

const getStoredLocation = (): LocationData | null => {
  try {
    const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!storedData) return null;

    const parsed = JSON.parse(storedData);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    const isExpired = Date.now() - parsed.timestamp > expiryTime;

    return isExpired ? null : parsed.location;
  } catch (err) {
    console.error("Failed to parse location:", err);
    return null;
  }
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<LocationData | null>(
    getStoredLocation()
  );

  useEffect(() => {
    if (location) return;

    fetch("https://ip-api.com/json/")
      .then((res) => res.json())
      .then((data) => {
        const newLocation: LocationData = {
          country: data.country,
          city: data.city,
        };

        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify({
            location: newLocation,
            timestamp: Date.now(),
          })
        );

        setLocation(newLocation);
      })
      .catch((error) => {
        console.error("Failed to get location:", error);
      });
  }, []);

  return location;
};

export default useLocationTracking;
