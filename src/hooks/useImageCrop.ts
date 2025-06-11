import { useState, useCallback } from "react";
import { CompanyInfo, CropState } from "@/lib/types";

export function useImageCrop() {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"logo" | "profilePic" | null>(null);
  const [originalImages, setOriginalImages] = useState<{
    logo?: string;
    profilePic?: string;
  }>({});
  const [cropState, setCropState] = useState<CropState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1,
    croppedAreaPixels: null,
  });

  const handleFileUpload = useCallback(
    (
      file: File | null,
      type: "logo" | "profilePic",
      setValue: (field: string, value: File | string) => void
    ) => {
      if (file) {
        console.log("handleFileUpload called for:", type, "file:", file);
        const reader = new FileReader();
        reader.onload = () => {
          const imageSrc = reader.result as string;
          console.log("File loaded, imageSrc:", imageSrc);
          setImageToCrop(imageSrc);
          setCropType(type);
          setCropDialogOpen(true);
          console.log("Opening crop dialog, state:", {
            imageSrc,
            type,
            cropDialogOpen: true,
          });
          setOriginalImages((prev) => ({ ...prev, [type]: imageSrc }));
          setCropState({
            crop: { x: 0, y: 0 },
            zoom: 1,
            aspect: type === "logo" ? 3 / 1 : 1,
            croppedAreaPixels: null,
          });
          setValue(type === "logo" ? "logoSrc" : "profilePicSrc", file);
        };
        reader.readAsDataURL(file);
      } else {
        console.log("No file provided for upload:", type);
      }
    },
    []
  );

  const handleCropExistingImage = useCallback(
    (type: "logo" | "profilePic", imageSrc: string) => {
      console.log(
        "handleCropExistingImage called for:",
        type,
        "imageSrc:",
        imageSrc
      );
      setImageToCrop(imageSrc);
      setCropType(type);
      setCropDialogOpen(true);
      console.log("Opening crop dialog for existing image, state:", {
        imageSrc,
        type,
        cropDialogOpen: true,
      });
      setOriginalImages((prev) => ({ ...prev, [type]: imageSrc }));
      setCropState({
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: type === "logo" ? 3 / 1 : 1,
        croppedAreaPixels: null,
      });
    },
    []
  );

  const handleCropImage = useCallback(
    async (
      updateCompanyInfo: (
        info: Partial<CompanyInfo>,
        logoFile?: File | null,
        profilePicFile?: File | null
      ) => Promise<void>,
      setValue: (field: string, value: File | string) => void
    ) => {
      if (imageToCrop && cropState.croppedAreaPixels && cropType) {
        try {
          console.log("Cropping image with state:", {
            imageToCrop,
            cropState,
            cropType,
          });
          const croppedImage = await getCroppedImg(
            imageToCrop,
            cropState.croppedAreaPixels
          );
          setValue(
            cropType === "logo" ? "logoSrc" : "profilePicSrc",
            croppedImage
          );
          await updateCompanyInfo(
            {},
            cropType === "logo" ? croppedImage : null,
            cropType === "profilePic" ? croppedImage : null
          );
          setCropDialogOpen(false);
          setImageToCrop(null);
          setCropType(null);
          console.log("Image cropped and saved successfully");
        } catch (error) {
          console.error("Error cropping image:", error);
        }
      } else {
        console.error("Missing required cropping data:", {
          imageToCrop,
          croppedAreaPixels: cropState.croppedAreaPixels,
          cropType,
        });
      }
    },
    [imageToCrop, cropState, cropType]
  );

  async function getCroppedImg(
    imageSrc: string,
    croppedAreaPixels: { x: number; y: number; width: number; height: number }
  ): Promise<File> {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(
              new File([blob], `cropped-${Date.now()}.jpeg`, {
                type: "image/jpeg",
              })
            );
          }
        },
        "image/jpeg",
        0.9
      );
    });
  }

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
    originalImages,
  };
}
