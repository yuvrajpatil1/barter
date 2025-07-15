"use client";
import { useState, useEffect } from "react";
import { UAParser } from "ua-parser-js";

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();

    //set device info only when component mounts
    setDeviceInfo(
      `${result.device.type || "Desktop"} - ${result.os.name} ${
        result.os.version
      } - ${result.browser.name} ${result.browser.version}`
    );
  }, []);
  return deviceInfo;
};

export default useDeviceTracking;
