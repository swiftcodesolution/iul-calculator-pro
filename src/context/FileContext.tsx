"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FileContextType {
  selectedFileId: string | null;
  setSelectedFileId: (fileId: string | null) => void;
  clearSelectedFileId: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const clearSelectedFileId = () => setSelectedFileId(null);

  return (
    <FileContext.Provider
      value={{ selectedFileId, setSelectedFileId, clearSelectedFileId }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
}
