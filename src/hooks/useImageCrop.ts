import { useState, useCallback } from "react";
import { CompanyInfo, CropState } from "@/lib/types";

export function useImageCrop(
  companyInfo: CompanyInfo,
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void
) {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"logo" | "profilePic" | null>(null);
  const [cropState, setCropState] = useState<CropState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1,
    croppedAreaPixels: null,
  });

  const handleFileUpload = useCallback(
    (file: File | null, type: "logo" | "profilePic") => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageToCrop(reader.result as string);
          setCropType(type);
          setCropDialogOpen(true);
          setCropState({
            crop: { x: 0, y: 0 },
            zoom: 1,
            aspect: type === "logo" ? 3 / 1 : 1,
            croppedAreaPixels: null,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleCropExistingImage = useCallback(
    (type: "logo" | "profilePic") => {
      const imageSrc =
        type === "logo" ? companyInfo.logoSrc : companyInfo.profilePicSrc;
      if (imageSrc) {
        setImageToCrop(imageSrc);
        setCropType(type);
        setCropState({
          crop: { x: 0, y: 0 },
          zoom: 1,
          aspect: type === "logo" ? 3 / 1 : 1,
          croppedAreaPixels: null,
        });
        setTimeout(() => setCropDialogOpen(true), 0);
      }
    },
    [companyInfo.logoSrc, companyInfo.profilePicSrc]
  );

  const handleCropImage = useCallback(async () => {
    if (imageToCrop && cropState.croppedAreaPixels && cropType) {
      try {
        const croppedImage = await getCroppedImg(
          imageToCrop,
          cropState.croppedAreaPixels
        );
        updateCompanyInfo(
          cropType === "logo"
            ? { logoSrc: croppedImage }
            : { profilePicSrc: croppedImage }
        );
        setCropDialogOpen(false);
        setImageToCrop(null);
        setCropType(null);
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    }
  }, [imageToCrop, cropState.croppedAreaPixels, cropType, updateCompanyInfo]);

  return {
    cropDialogOpen,
    setCropDialogOpen,
    imageToCrop,
    setImageToCrop,
    cropType,
    setCropType,
    cropState,
    setCropState,
    handleFileUpload,
    handleCropExistingImage,
    handleCropImage,
  };
}

async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return canvas.toDataURL("image/jpeg");
}
