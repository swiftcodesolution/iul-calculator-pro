"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cropper from "react-easy-crop";
import { throttle } from "lodash";
import { CompanyInfo, CropState } from "@/lib/types";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageToCrop: string | null;
  cropType: "logo" | "profilePic" | null;
  cropState: CropState;
  setCropState: (state: CropState) => void;
  handleCropImage: (
    setValue: (field: string, value: File | string) => void
  ) => Promise<void>;
  setImageToCrop: (src: string | null) => void;
  setCropType: (type: "logo" | "profilePic" | null) => void;
  updateCompanyInfo: (
    info: Partial<CompanyInfo>,
    logoFile?: File | null,
    profilePicFile?: File | null
  ) => Promise<CompanyInfo>;
  setValue: (field: string, value: File | string) => void;
  originalImages: { logo?: string; profilePic?: string };
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
    setValue,
  }: CropDialogProps) => {
    const isInitialMount = useRef(true);
    const isClosing = useRef(false);
    const [selectedAspect, setSelectedAspect] = useState<number>(
      cropState.aspect
    );

    useEffect(() => {
      console.log(
        "CropDialog open state:",
        open,
        "imageToCrop:",
        imageToCrop,
        "cropType:",
        cropType
      );
      isInitialMount.current = false;
      return () => {
        isInitialMount.current = true;
        isClosing.current = false;
      };
    }, [open, imageToCrop, cropType]);

    const handleCropChange = useCallback(
      throttle((crop: { x: number; y: number }) => {
        if (!isInitialMount.current) {
          setCropState({ ...cropState, crop });
        }
      }, 50),
      [setCropState, cropState]
    );

    const handleZoomChange = useCallback(
      throttle((zoom: number) => {
        if (!isInitialMount.current) {
          setCropState({ ...cropState, zoom });
        }
      }, 50),
      [setCropState, cropState]
    );

    const handleCropComplete = useCallback(
      throttle(
        (
          _: unknown,
          croppedAreaPixels: {
            x: number;
            y: number;
            width: number;
            height: number;
          }
        ) => {
          if (!isInitialMount.current) {
            setCropState({ ...cropState, croppedAreaPixels });
          }
        },
        50
      ),
      [setCropState, cropState]
    );

    const handleAspectChange = useCallback(
      (value: string) => {
        const newAspect = parseFloat(value);
        setSelectedAspect(newAspect);
        setCropState({ ...cropState, aspect: newAspect });
      },
      [setCropState, cropState]
    );

    const handleDialogClose = useCallback(() => {
      console.log("Closing CropDialog");
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
      setSelectedAspect(1);
    }, [onOpenChange, setImageToCrop, setCropType, setCropState]);

    return (
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          console.log("Dialog onOpenChange:", newOpen);
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
                  onCropComplete={handleCropComplete}
                  restrictPosition={false}
                  minZoom={0.5}
                />
              )}
            </div>
            <div>
              <Label>Aspect Ratio</Label>
              <Select
                onValueChange={handleAspectChange}
                value={selectedAspect.toString()}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1:1 (Square)</SelectItem>
                  <SelectItem value="3">3:1 (Wide)</SelectItem>
                  <SelectItem value="1.33">4:3 (Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Zoom</Label>
              <Slider
                value={[cropState.zoom]}
                onValueChange={([zoom]) => handleZoomChange(zoom)}
                min={0.5}
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
              <Button
                onClick={() => {
                  console.log("Crop & Save clicked, cropState:", cropState);
                  handleCropImage(setValue);
                }}
              >
                Crop & Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

CropDialog.displayName = "CropDialog";
export default CropDialog;
