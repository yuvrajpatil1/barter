"use client";
import axiosInstance from "@/shared/utils/axiosInstance";
import React, { useEffect, useState } from "react";

const tabs = ["Categories", "Logo", "Banners"];

const CustomizationPage = () => {
  const [activeTab, setActiveTab] = useState("Categories"); // Fixed typo: "Categores" -> "Categories"
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, string[]>>( // Fixed type: string -> string[]
    {}
  );
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null); // Fixed variable name: Banner -> banner

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const res = await axiosInstance.get("/admin/api/get-all");
        const data = res.data;

        setCategories(data.categories || []);
        setSubCategories(data.subCategories || {});
        setLogo(data.logo || null);
        setBanner(data.banner || null);
        // Removed duplicate setBanner line
      } catch (err) {
        console.error("Failed to fetch customization data", err);
      }
    };

    fetchCustomization(); // Added function call - was missing!
  }, []); // Added dependency array

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axiosInstance.post("/admin/api/add-category", {
        category: newCategory,
      });
      setCategories((prev) => [...prev, newCategory]);
      setNewCategory("");
    } catch (error) {
      console.log("Error adding category", error);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim() || !selectedCategory) return; // Fixed typo: selectedCtegory -> selectedCategory
    try {
      await axiosInstance.post("/admin/api/add-subcategory", {
        category: selectedCategory,
        subCategory: newSubcategory,
      });
      setSubCategories((prev) => ({
        ...prev,
        [selectedCategory]: [
          ...(prev[selectedCategory] || []), // Fixed: Banner(...) -> ...(...) - Banner is not a function
          newSubcategory,
        ],
      }));
      setNewSubcategory(""); // Added: Clear input after adding
      setSelectedCategory(""); // Added: Clear selection after adding
    } catch (error) {
      console.error("Error adding subcategory", error);
    }
  };

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Customization</h2>

      {/* Tabs */}
      <div className="flex items-center gap-6 mt-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab} // Added key prop
            onClick={() => setActiveTab(tab)} // Added onClick handler
            className={`pb-2 px-1 transition-colors ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`} // Added styling for active/inactive tabs
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8 text-white">
        {activeTab === "Categories" && (
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-gray-400">No categories found.</p>
            ) : (
              categories.map((cat, idx) => (
                <div key={idx}>
                  <p className="font-semibold mb-1">{cat}</p>
                  {subCategories?.[cat]?.length > 0 ? (
                    <ul className="ml-4 text-sm text-gray-400 list-disc">
                      {subCategories[cat].map((sub, i) => (
                        <li key={i}>{sub}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-4 text-xs text-gray-500 italic">
                      No subcategories
                    </p>
                  )}
                </div>
              ))
            )}

            {/* Add new category */}
            <div className="flex gap-2">
              {" "}
              {/* Added flex layout */}
              <input
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
              />
              <button
                onClick={handleAddCategory}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
              >
                Add Category
              </button>
            </div>

            {/* Add subcategory */}
            <div className="pt-4 flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 outline-none text-white border border-gray-600 px-2 py-1 rounded" // Added padding and border-radius
              >
                <option value="">Select Category</option>
                {categories.map((cat, i) => (
                  <option value={cat} key={i}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="New Subcategory"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
              />
              <button
                onClick={handleAddSubcategory}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
              >
                Add Subcategory
              </button>
            </div>
          </div>
        )}

        {activeTab === "Logo" && (
          <div className="space-y-4">
            {logo ? (
              <img
                src={logo}
                alt="Platform Logo"
                className="w-[120px] h-auto border border-gray-600 p-2 bg-white"
              />
            ) : (
              <p className="text-gray-400">No logo uploaded.</p>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const res = await axiosInstance.post(
                      "/admin/api/upload-logo",
                      formData
                    );
                    setLogo(res.data.logo);
                  } catch (error) {
                    console.error("Logo upload failed.", error);
                  }
                }}
                className="text-sm text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "Banners" && ( // Fixed: "Banner" -> "Banners" to match tab name
          <div className="space-y-4">
            {banner ? (
              <img
                src={banner}
                alt="Platform banner"
                className="w-full max-w-[600px] h-auto border border-gray-600 rounded-md"
              />
            ) : (
              <p className="text-gray-400">No Banner uploaded.</p>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const res = await axiosInstance.post(
                      "/admin/api/upload-banner",
                      formData
                    );
                    setBanner(res.data.banner);
                  } catch (error) {
                    console.log("Banner upload failed", error);
                  }
                }}
                className="text-sm text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationPage;
