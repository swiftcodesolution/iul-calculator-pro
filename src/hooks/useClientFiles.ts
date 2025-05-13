import { useState } from "react";
import { ClientFile } from "@/lib/types";

const initialClientFiles: ClientFile[] = [
  { id: "1", name: "Age 30-65", size: "20k", category: "Pro Sample Files" },
  { id: "2", name: "Age 35-65", size: "10k", category: "Pro Sample Files" },
  { id: "3", name: "Age 40-65", size: "10k", category: "Pro Sample Files" },
  { id: "4", name: "test", size: "N/A", category: "Your Sample Files" },
];

export function useClientFiles() {
  const [clientFiles, setClientFiles] =
    useState<ClientFile[]>(initialClientFiles);
  const [newClientName, setNewClientName] = useState("");
  const [selectedFile, setSelectedFile] = useState<ClientFile | null>(null);
  const [dialogAction, setDialogAction] = useState<string | null>(null);

  const handleClientAction = (
    action: string,
    data?: { id?: string; name?: string }
  ) => {
    if (action === "new" && newClientName) {
      const newClient: ClientFile = {
        id: Date.now().toString(),
        name: newClientName,
        size: "N/A",
        category: "Your Prospect Files",
      };
      setClientFiles((prev) => [...prev, newClient]);
      setNewClientName("");
      setDialogAction(null);
    } else if (action === "latest") {
      console.log("Get Latest clicked");
    } else if (data?.id) {
      if (action === "open") {
        console.log(`Opening file: ${data.id}`);
        setDialogAction(null);
      } else if (action === "copy" && data.name) {
        const fileToCopy = clientFiles.find((file) => file.id === data.id);
        if (fileToCopy) {
          const newFile: ClientFile = {
            ...fileToCopy,
            id: Date.now().toString(),
            name: data.name,
          };
          setClientFiles((prev) => [...prev, newFile]);
        }
        setNewClientName("");
        setSelectedFile(null);
        setDialogAction(null);
      } else if (action === "rename" && data.name) {
        setClientFiles((prev) =>
          prev.map((file) =>
            file.id === data.id
              ? { ...file, name: data.name ?? file.name }
              : file
          )
        );
        setNewClientName("");
        setSelectedFile(null);
        setDialogAction(null);
      } else if (action === "delete") {
        setClientFiles((prev) => prev.filter((file) => file.id !== data.id));
        setSelectedFile(null);
        setDialogAction(null);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetCategory: ClientFile["category"]
  ) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setClientFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, category: targetCategory } : file
      )
    );
  };

  return {
    clientFiles,
    newClientName,
    setNewClientName,
    selectedFile,
    setSelectedFile,
    dialogAction,
    setDialogAction,
    handleClientAction,
    handleDragStart,
    handleDrop,
  };
}
