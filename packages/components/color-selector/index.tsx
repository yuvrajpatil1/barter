import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
  "#000000", // Black
  "#ffffff", // White
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
  "#ffa500", // Orange
  "#800080", // Purple
  "#ffc0cb", // Pink
  "#a52a2a", // Brown
  "#808080", // Gray
  "#90ee90", // Light Green
  "#ff69b4", // Hot Pink
  "#4169e1", // Royal Blue
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Colors</label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);

              const isLightColor = ["#ffffff", "#ffff00"].includes(color);

              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${
                    isSelected ? "scale-105 border-white" : "border-transparent"
                  } ${isLightColor ? "border-gray-600" : ""}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Add new color */}
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-dashed border-gray-500 bg-gray-800 hover:bg-gray-700 hover:border-gray-400 transition-colors"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Plus size={16} color="white" />
            </button>

            {/* Color picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-0 border-none cursor-pointer rounded"
                  title="Choose custom color"
                />
                <button
                  type="button"
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  onClick={() => setShowColorPicker(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
