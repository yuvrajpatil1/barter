"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryData {
  name: string;
  users: number;
  sellers: number;
}

const countryData: CountryData[] = [
  { name: "India", users: 200, sellers: 35 },
  { name: "United States of America", users: 109, sellers: 18 },
  { name: "China", users: 100, sellers: 22 },
  { name: "Germany", users: 92, sellers: 12 },
  { name: "France", users: 55, sellers: 7 },
];

const getColor = (countryName: string): string => {
  const country = countryData.find((c) => c.name === countryName);
  if (!country) return "#1e293b";

  const total = country.users + country.sellers;
  if (total > 100) return "#22c55e";
  if (total > 0) return "#3b82f6";
  return "#1e293b";
};

interface HoveredCountry {
  name: string;
  users: number;
  sellers: number;
}

const GeographicalMap: React.FC = () => {
  const [hovered, setHovered] = useState<HoveredCountry | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="relative w-full px-0 py-5 overflow-visible">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 230, center: [0, 10] }}
        width={1400}
        height={500}
        viewBox="0 0 1400 500"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: "100%",
          height: "35vh",
          background: "transparent",
          margin: 0,
          padding: 0,
          display: "block",
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const countryName = geo.properties.NAME || geo.properties.name;
              const match = countryData.find((c) => c.name === countryName);
              const baseColor = getColor(countryName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e: React.MouseEvent) => {
                    setTooltipPosition({ x: e.pageX, y: e.pageY });
                    setHovered({
                      name: countryName,
                      users: match?.users || 0,
                      sellers: match?.sellers || 0,
                    });
                  }}
                  onMouseMove={(e: React.MouseEvent) => {
                    setTooltipPosition({ x: e.pageX, y: e.pageY });
                  }}
                  onMouseLeave={() => setHovered(null)}
                  fill={baseColor}
                  stroke="#334155"
                  style={{
                    default: {
                      outline: "none",
                      transition: "fill 0.3s ease-in-out",
                    },
                    hover: {
                      fill: match ? baseColor : "#facc15",
                      outline: "none",
                      transition: "fill 0.3s ease-in-out",
                    },
                    pressed: { fill: "#ef4444", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip with animation */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="fixed bg-gray-800 text-white text-xs p-2 rounded shadow-lg pointer-events-none z-50"
            style={{
              top: tooltipPosition.y - 60,
              left: tooltipPosition.x + 10,
            }}
          >
            <strong>{hovered.name}</strong>
            <br />
            Users: <span className="text-green-400">{hovered.users}</span>
            <br />
            Sellers: <span className="text-yellow-400">{hovered.sellers}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeographicalMap;
