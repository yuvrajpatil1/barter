//components/image-placeholder/index.tsx
import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const ImagePlaceholder = ({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = null!,
  setOpenImageModal,
  setSelectedImage,
  pictureUploadingLoader,
  images,
}: {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
  defaultImage?: string | null;
  index?: number;
  setOpenImageModal: (openImageModal: boolean) => void;
  setSelectedImage: (e: string) => void;
  pictureUploadingLoader: boolean;
  images: (UploadedImage | null)[];
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  React.useEffect(() => {
    if (index !== null && images[index]) {
      setImagePreview(images[index]!.file_url);
    } else {
      setImagePreview(null);
    }
  }, [images, index]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && index !== null) {
      const objectURL = URL.createObjectURL(file);
      setImagePreview(objectURL);
      onImageChange(file, index);
      return () => URL.revokeObjectURL(objectURL);
    }
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <>
          <button
            type="button"
            disabled={pictureUploadingLoader}
            className="absolute top-3 left-3 p-2 rounded bg-red-600 hover:bg-red-700 shadow-lg transition-colors z-10"
            title="Remove image"
            onClick={() => index !== null && onRemove(index)}
          >
            <X size={16} />
          </button>
          <button
            disabled={pictureUploadingLoader}
            type="button"
            className="absolute top-3 right-3 p-2 rounded bg-blue-500 hover:bg-blue-600 shadow-lg transition-colors z-10"
            title="Edit image"
            onClick={() => {
              if (index !== null && images[index] && images[index]?.file_url) {
                setOpenImageModal(true);
                setSelectedImage(images[index]!.file_url);
              }
            }}
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 rounded bg-slate-700 shadow-lg cursor-pointer"
        >
          <Pencil size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image
          width={400}
          height={300}
          src={imagePreview}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
          unoptimized
        />
      ) : (
        <>
          <p
            className={`text-gray-400 ${
              small ? "text-xl" : "text-4xl"
            } font-semibold`}
          >
            {size}
          </p>
          <p
            className={`text-gray-500 ${
              small ? "text-sm" : "text-lg"
            } pt-2 text-center`}
          >
            Please choose an image <br />
            according to the expected ratio.
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
