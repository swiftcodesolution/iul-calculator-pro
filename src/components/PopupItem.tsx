// src/components/PopupItem.tsx
"use client";

import { useDrag, useDrop } from "react-dnd";
import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Popup = { id: string; title: string; visible: boolean };

type PopupItemProps = {
  popup: Popup;
  index: number;
  movePopup: (dragIndex: number, hoverIndex: number) => void;
  toggleVisibility: () => void;
  updateTitle: (title: string) => void;
  deletePopup: () => void;
};

export default function PopupItem({
  popup,
  index,
  movePopup,
  toggleVisibility,
  updateTitle,
  deletePopup,
}: PopupItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(popup.title);

  const [{ isDragging }, drag] = useDrag({
    type: "popup",
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: "popup",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        movePopup(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  const handleSave = () => {
    updateTitle(editTitle);
    setIsEditing(false);
  };

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 p-2 bg-gray-100 rounded ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Checkbox
        checked={popup.visible}
        onCheckedChange={toggleVisibility}
        aria-label={`Toggle visibility for ${popup.title}`}
      />
      {isEditing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-32"
          />
          <Button variant="ghost" size="sm" onClick={handleSave}>
            Save
          </Button>
        </>
      ) : (
        <>
          <span
            className="text-sm text-gray-900 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {popup.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={deletePopup}
            aria-label={`Delete ${popup.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
