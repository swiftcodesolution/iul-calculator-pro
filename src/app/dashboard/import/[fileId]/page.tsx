"use client";

import { use, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { motion, AnimatePresence } from "motion/react"; // Reverted import
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ZoomIn, ZoomOut, Fullscreen, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { useTableStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useTableHighlight } from "@/hooks/useTableHighlight";
import { useSession } from "next-auth/react";
import { cn, debounce } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ClientFile } from "@/lib/types";

type TableData = {
  source: string;
  page_number: number;
  data: Record<string, string | number>[];
};

type ApiResponse = {
  tables: TableData[];
  message?: string | null;
};

type Params = Promise<{ fileId: string }>;

const API_ENDPOINT =
  "https://iul-calculator-pro-production.up.railway.app/upload-pdf/";

export default function ImportPage({ params }: { params: Params }) {
  const { fileId } = use(params);
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Changed to match calculator
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false); // Single fetch
  const [isTableLoading, setIsTableLoading] = useState(false); // Renamed for clarity
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const { tables, setTables, clearTables } = useTableStore();
  const router = useRouter();
  const {
    highlightedRows,
    highlightedColumns,
    handleRowClick,
    handleColumnClick,
  } = useTableHighlight();

  // Auth and file check (single fetch)
  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session?.user?.id ||
      !fileId ||
      hasFetched
    ) {
      return;
    }

    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}`);
        if (!response.ok) {
          if (response.status === 400 || response.status === 404) {
            setError("File not found");
            notFound();
          } else {
            setError("Failed to fetch file");
          }
          return;
        }
        const data: ClientFile = await response.json();
        setTables(data.tablesData?.tables || []);
        setHasFetched(true);
      } catch {
        setError("Error fetching file");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId, session, status, hasFetched, setTables]);

  // Debounced save
  const saveChanges = debounce(
    async () => {
      if (!fileId || status !== "authenticated" || !session?.user?.id) return;
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tablesData: { tables } }),
        });
        if (!response.ok) setError("Failed to save changes");
      } catch {
        setError("Error saving changes");
      }
    },
    1000,
    { leading: false, trailing: true }
  );

  // Save on tables change
  useEffect(() => {
    if (tables.length > 0) saveChanges();
    return () => saveChanges.cancel();
  }, [tables, saveChanges]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    let selectedFile: File | null = null;
    if ("dataTransfer" in e) {
      selectedFile = e.dataTransfer.files?.[0] || null;
    } else {
      selectedFile = e.target.files?.[0] || null;
    }
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null); // Match calculator
      clearTables();
      setZoomLevel(1);
      setIsTableFullScreen(false);
    } else {
      setFile(null);
      setError("Please upload a valid PDF file.");
      toast("Please upload a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      toast("Please select a PDF file.");
      return;
    }
    setIsTableLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post<ApiResponse>(API_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.tables) {
        setTables(response.data.tables);
        toast(`Extracted ${response.data.tables.length} tables from PDF.`);
      } else {
        setError(response.data.message || "No tables found.");
        toast(
          response.data.message ||
            "The PDF didn't contain any extractable tables."
        );
      }
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      const errorMessage =
        error.response?.data?.detail || "Error uploading PDF.";
      setError(errorMessage);
      toast(errorMessage);
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImport = () => {
    if (!tables.length) return;
    toast("Data imported successfully.");
    router.push(`/dashboard/calculator/${fileId}`);
  };

  const handleCancel = () => {
    setFile(null);
    clearTables();
    setError(null);
    setZoomLevel(1);
    setIsTableFullScreen(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleFullScreenToggle = () => {
    setIsTableFullScreen((prev) => !prev);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grow h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row gap-4 flex-1"
      >
        <AnimatePresence>
          {!isTableFullScreen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:w-[70%] w-full overflow-y-auto flex h-[90vh]"
            >
              <div className="grow">
                {tables.length > 0 && !isTableLoading ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-white z-10">
                      Imported Data Preview
                    </h3>
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "top left",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <div
                        className={
                          tables.length > 2 ? "flex gap-0" : "flex gap-0"
                        }
                      >
                        {tables.map((table, index) => {
                          const columns = Object.keys(
                            table.data[0] || {}
                          ).filter(
                            (key) =>
                              key !== "Source_Text" && key !== "Page_Number"
                          );

                          return (
                            <div
                              key={index}
                              className={
                                tables.length === 2
                                  ? index === 0
                                    ? "w-[80%]"
                                    : "w-[20%]"
                                  : "grow"
                              }
                            >
                              <Table className="border table-fixed w-full">
                                <TableHeader>
                                  <TableRow>
                                    {columns.map((header) => (
                                      <TableHead
                                        key={header}
                                        className={cn(
                                          "border whitespace-normal break-words min-h-[60px] align-top cursor-pointer",
                                          highlightedColumns.has(header)
                                            ? "bg-[#ffa1ad]"
                                            : ""
                                        )}
                                        style={{
                                          width: `${100 / columns.length}%`,
                                        }}
                                        onClick={() =>
                                          handleColumnClick(header)
                                        }
                                      >
                                        {header}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {table.data.map((row, rowIndex) => (
                                    <TableRow
                                      key={rowIndex}
                                      className={cn(
                                        "min-h-[60px] cursor-pointer",
                                        highlightedRows.has(rowIndex)
                                          ? "bg-[#ffa1ad]"
                                          : ""
                                      )}
                                      onClick={() => handleRowClick(rowIndex)}
                                    >
                                      {columns.map((col) => (
                                        <TableCell
                                          key={col}
                                          className={cn(
                                            "border whitespace-normal break-words align-top",
                                            highlightedColumns.has(col) ||
                                              highlightedRows.has(rowIndex)
                                              ? "bg-[#ffa1ad]"
                                              : ""
                                          )}
                                          style={{
                                            width: `${100 / columns.length}%`,
                                          }}
                                        >
                                          {row[col] ?? "-"}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      Tables will be displayed here once a PDF is uploaded.
                    </p>
                  </Card>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              className="fixed inset-0 z-50 bg-white p-4 flex flex-col"
            >
              <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Imported Data Preview
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFullScreenToggle}
                    disabled={isTableLoading}
                    aria-label="Exit full-screen mode"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent
                  className="overflow-y-auto flex-1"
                  style={{ maxHeight: "calc(100vh - 80px)" }}
                >
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "top left",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <div
                      className={
                        tables.length > 2 ? "flex gap-0" : "flex gap-0"
                      }
                    >
                      {tables.map((table, index) => {
                        const columns = Object.keys(table.data[0] || {}).filter(
                          (key) =>
                            key !== "Source_Text" && key !== "Page_Number"
                        );

                        return (
                          <div
                            key={index}
                            className={
                              tables.length === 2
                                ? index === 0
                                  ? "w-[80%]"
                                  : "w-[20%]"
                                : tables.length > 2
                                ? "flex-1 min-w-[300px] max-w-[500px]"
                                : "w-full"
                            }
                          >
                            <Table className="border table-fixed w-full">
                              <TableHeader>
                                <TableRow>
                                  {columns.map((header) => (
                                    <TableHead
                                      key={header}
                                      className={cn(
                                        "border whitespace-normal break-words min-h-[60px] align-top cursor-pointer",
                                        highlightedColumns.has(header)
                                          ? "bg-[#ffa1ad]"
                                          : ""
                                      )}
                                      style={{
                                        width: `${100 / columns.length}%`,
                                      }}
                                      onClick={() => handleColumnClick(header)}
                                    >
                                      {header}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {table.data.map((row, rowIndex) => (
                                  <TableRow
                                    key={rowIndex}
                                    className={cn(
                                      "min-h-[60px] cursor-pointer",
                                      highlightedRows.has(rowIndex)
                                        ? "bg-[#ffa1ad]"
                                        : ""
                                    )}
                                    onClick={() => handleRowClick(rowIndex)}
                                  >
                                    {columns.map((col) => (
                                      <TableCell
                                        key={col}
                                        className={cn(
                                          "border whitespace-normal break-words align-top",
                                          highlightedColumns.has(col) ||
                                            highlightedRows.has(rowIndex)
                                            ? "bg-[#ffa1ad]"
                                            : ""
                                        )}
                                        style={{
                                          width: `${100 / columns.length}%`,
                                        }}
                                      >
                                        {row[col] ?? "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="lg:w-[30%] w-full flex flex-col gap-4 lg:mt-auto"
        >
          {/* Disabled Input Fields */}
          <div className="flex flex-col gap-2">
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="policy-number">
                Illustration Date
              </Label>
              <Input
                className="w-2/4"
                id="policy-number"
                disabled
                placeholder="POL12345"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="start-date">
                Insured Name
              </Label>
              <Input
                className="w-2/4"
                id="start-date"
                disabled
                placeholder="2025-01-01"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="premium-amount">
                Initial Death Benefit
              </Label>
              <Input
                className="w-2/4"
                id="premium-amount"
                disabled
                placeholder="20000"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="insured-name">
                Assumed ROR
              </Label>
              <Input
                className="w-2/4"
                id="insured-name"
                disabled
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                Minimum Initial Pmt
              </Label>
              <Input
                className="w-2/4"
                id="assumed-ror"
                disabled
                placeholder="6.3%"
              />
            </div>
          </div>

          <Card className="border">
            <CardHeader>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-xl font-bold text-center"
              >
                Import PDF Illustration
              </motion.h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                onDragOver={handleDragOver}
                onDrop={handleFileChange}
              >
                <p className="text-gray-500 mb-2">
                  Drop PDF Here or Click to Select
                </p>
                <Button asChild>
                  <label className="flex items-center gap-2 cursor-pointer">
                    Select File
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </Button>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Uploaded: {file.name}
                  </p>
                )}
              </div>
              <Button
                onClick={handleUpload}
                disabled={isTableLoading}
                className="w-full"
              >
                {isTableLoading ? "Processing..." : "Upload"}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center text-red-500"
            >
              {error}
            </motion.div>
          )}
          {isTableLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-500"
            >
              Processing...
            </motion.div>
          )}
          {tables.length > 0 && !isTableLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex justify-center gap-4"
            >
              <Button
                variant="default"
                onClick={handleImport}
                disabled={isTableLoading}
              >
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isTableLoading}
              >
                Clear
              </Button>
            </motion.div>
          )}
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleZoomIn}
              disabled={isTableLoading || zoomLevel >= 2 || !tables.length}
              aria-label="Zoom in on table"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              onClick={handleZoomOut}
              disabled={isTableLoading || zoomLevel <= 0.5 || !tables.length}
              aria-label="Zoom out on table"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleFullScreenToggle}
              disabled={isTableLoading || !tables.length}
              aria-label={
                isTableFullScreen
                  ? "Exit full-screen mode"
                  : "Enter full-screen mode"
              }
            >
              {isTableFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Fullscreen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
