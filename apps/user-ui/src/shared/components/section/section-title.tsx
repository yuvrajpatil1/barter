import React from "react";

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="relative">
      <h1 className="md:text-3xl block text-xl relative z-10 font-semibold border-b-2 border-gray-400">
        {title}
      </h1>
    </div>
  );
};

export default SectionTitle;
