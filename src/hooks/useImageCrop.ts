import { useState, useCallback } from "react";
import { CropState } from "@/lib/types";
import { getCroppedImg } from "@/lib/utils";

export function useImageCrop() {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"logo" | "profilePic" | null>(null);
  const [cropState, setCropState] = useState<CropState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1,
    croppedAreaPixels: null,
  });
  const [originalImages, setOriginalImages] = useState<{
    logo?: string;
    profilePic?: string;
  }>({});

  const handleFileUpload = useCallback(
    (
      file: File | null,
      type: "logo" | "profilePic",
      setValue: (field: string, value: File | string) => void
    ) => {
      console.log("handleFileUpload called:", { file, type });
      if (!file) {
        console.log(`No file selected for ${type}, setting to empty string`);
        setValue(`${type}Src`, "");
        setOriginalImages((prev) => ({ ...prev, [type]: undefined }));
        return;
      }
      try {
        const imageUrl = URL.createObjectURL(file);
        console.log(`File selected for ${type}, imageUrl:`, imageUrl);
        setOriginalImages((prev) => ({ ...prev, [type]: imageUrl }));
        setImageToCrop(imageUrl);
        setCropType(type);
        setCropDialogOpen(true);
        setCropState({
          crop: { x: 0, y: 0 },
          zoom: 1,
          aspect: type === "logo" ? 3 : 1,
          croppedAreaPixels: null,
        });
        setValue(`${type}Src`, file);
      } catch (err) {
        console.error("Error processing file upload:", err);
      }
    },
    []
  );

  const handleCropExistingImage = useCallback(
    (type: "logo" | "profilePic", imageSrc: string) => {
      console.log("handleCropExistingImage called:", { type, imageSrc });
      setImageToCrop(imageSrc);
      setCropType(type);
      setCropDialogOpen(true);
      setCropState({
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: type === "logo" ? 3 : 1,
        croppedAreaPixels: null,
      });
    },
    []
  );

  const handleCropImage = useCallback(
    async (setValue: (field: string, value: File | string) => void) => {
      console.log("handleCropImage called, cropState:", cropState);
      if (!imageToCrop || !cropType || !cropState.croppedAreaPixels) {
        console.error("Missing crop data:", {
          imageToCrop,
          cropType,
          cropState,
        });
        return;
      }
      try {
        const croppedImage = await getCroppedImg(
          imageToCrop,
          cropState.croppedAreaPixels,
          cropType
        );
        console.log(`Cropped image for ${cropType}:`, croppedImage);
        setValue(`${cropType}Src`, croppedImage);
        setCropDialogOpen(false);
        setImageToCrop(null);
        setCropType(null);
        setCropState({
          crop: { x: 0, y: 0 },
          zoom: 1,
          aspect: 1,
          croppedAreaPixels: null,
        });
      } catch (err) {
        console.error("Error cropping image:", err);
      }
    },
    [imageToCrop, cropType, cropState]
  );

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
    handleCropImage,
    handleCropExistingImage,
    originalImages,
  };
}
