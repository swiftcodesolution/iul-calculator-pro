"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";
import { debounce } from "@/lib/utils";
import { CropState } from "@/lib/types";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageToCrop: string | null;
  cropType: "logo" | "profilePic" | null;
  cropState: CropState;
  setCropState: (state: CropState) => void;
  handleCropImage: () => void;
  setImageToCrop: (src: string | null) => void;
  setCropType: (type: "logo" | "profilePic" | null) => void;
}

const CropDialog = memo(
  ({
    open,
    onOpenChange,
    imageToCrop,
    cropType,
    cropState,
    setCropState,
    handleCropImage,
    setImageToCrop,
    setCropType,
  }: CropDialogProps) => {
    const isInitialMount = useRef(true);
    const isClosing = useRef(false);

    const handleCropChange = useCallback(
      (crop: { x: number; y: number }) => {
        if (!isInitialMount.current) {
          const debounced = debounce(
            (newCrop: { x: number; y: number }) => {
              setCropState({
                ...cropState,
                crop: newCrop,
              });
            },
            100,
            { leading: false, trailing: true }
          );
          debounced(crop);
          return () => debounced.cancel();
        }
        return () => {};
      },
      [setCropState, cropState]
    );

    const handleZoomChange = useCallback(
      (zoom: number) => {
        if (!isInitialMount.current) {
          const debounced = debounce(
            (newZoom: number) => {
              setCropState({
                ...cropState,
                zoom: newZoom,
              });
            },
            100,
            { leading: false, trailing: true }
          );
          debounced(zoom);
          return () => debounced.cancel();
        }
        return () => {};
      },
      [setCropState, cropState]
    );

    const handleCropComplete = useCallback(
      (croppedAreaPixels: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => {
        if (!isInitialMount.current) {
          const debounced = debounce(
            (newCroppedAreaPixels: {
              x: number;
              y: number;
              width: number;
              height: number;
            }) => {
              setCropState({
                ...cropState,
                croppedAreaPixels: newCroppedAreaPixels,
              });
            },
            100,
            { leading: false, trailing: true }
          );
          debounced(croppedAreaPixels);
          return () => debounced.cancel();
        }
        return () => {};
      },
      [setCropState, cropState]
    );

    useEffect(() => {
      isInitialMount.current = false;
      return () => {
        isInitialMount.current = true;
        isClosing.current = false;
      };
    }, []);

    const handleDialogClose = useCallback(() => {
      isClosing.current = true;
      onOpenChange(false);
      setImageToCrop(null);
      setCropType(null);
      setCropState({
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: 1,
        croppedAreaPixels: null,
      });
    }, [onOpenChange, setImageToCrop, setCropType, setCropState]);

    return (
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen && !isClosing.current) {
            handleDialogClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Crop {cropType === "logo" ? "Logo" : "Profile Picture"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-64">
              {imageToCrop && open && (
                <Cropper
                  image={imageToCrop}
                  crop={cropState.crop}
                  zoom={cropState.zoom}
                  aspect={cropState.aspect}
                  onCropChange={handleCropChange}
                  onZoomChange={handleZoomChange}
                  onCropComplete={(_croppedArea, croppedAreaPixels) =>
                    handleCropComplete(croppedAreaPixels)
                  }
                />
              )}
            </div>
            <div>
              <Label>Zoom</Label>
              <Slider
                value={[cropState.zoom]}
                onValueChange={([zoom]) => handleZoomChange(zoom)}
                min={1}
                max={3}
                step={0.1}
                className="mt-2"
                aria-label="Zoom level"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button onClick={handleCropImage}>Crop & Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

CropDialog.displayName = "CropDialog";
export default CropDialog;
