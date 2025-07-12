import React from "react";
import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const SizeSelector = ({ control, errors }: any) => {
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => {
                    const currentValue = field.value || [];
                    const newValue = isSelected
                      ? currentValue.filter((s: string) => s !== size)
                      : [...currentValue, size];
                    field.onChange(newValue);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-gray-700 text-white border border-gray-400"
                      : "bg-gray-800 text-gray-300 border border-gray-600"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors?.sizes && (
        <p className="text-red-500 text-xs mt-1">
          {errors.sizes.message as string}
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
