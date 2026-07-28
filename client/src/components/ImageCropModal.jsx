import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed"));
          return;
        }
        const croppedFile = new File([blob], "profile-cropped.jpg", {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(blob);
        resolve({ croppedFile, previewUrl });
      },
      "image/jpeg",
      0.95
    );
  });
}

export default function ImageCropModal({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setProcessing(true);
    try {
      const { croppedFile, previewUrl } = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedFile, previewUrl);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#E6E3DA] rounded-[16px] max-w-lg w-full overflow-hidden shadow-xl animate-slideDown flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#E6E3DA] flex items-center justify-between bg-[#F7F6F2]">
          <h2 className="text-sm font-bold text-[#16160F]">Crop Profile Picture</h2>
          <button
            onClick={onCancel}
            className="text-[#6B6858] hover:text-[#16160F] text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-72 sm:h-80 bg-[#0F1210]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls & Sliders */}
        <div className="p-5 space-y-4 bg-white">
          {/* Zoom Slider */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-[#6B6858]">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#1B4332] h-1.5 bg-[#E6E3DA] rounded-lg cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#16160F] w-8 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#6B6858] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-[10px] transition-all cursor-pointer"
            >
              Reset
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold text-[#6B6858] hover:text-[#16160F] bg-[#F7F6F2] border border-[#E6E3DA] rounded-[10px] transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={processing}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-[10px] transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {processing && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Save Crop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
