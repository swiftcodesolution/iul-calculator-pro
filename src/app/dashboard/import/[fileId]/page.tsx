"use client";

import { use, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { motion, AnimatePresence } from "motion/react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TableData = {
  source: string;
  page_number: number;
  data: Record<string, string | number>[];
};

type ApiResponse = {
  tables: TableData[];
  fields: {
    illustration_date: string | null;
    insured_name: string | null;
    initial_death_benefit: string | null;
    assumed_ror: string | null;
    minimum_initial_pmt: string | null;
  };
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
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [highlightColor, setHighlightColor] = useState("#ffa1ad");
  const [isReadOnly, setIsReadOnly] = useState(false); // New state for read-only mode

  const [tablesDataFields, setTablesDataFields] = useState({
    startingBalance: 0,
    annualContributions: 0,
    annualEmployerMatch: 0,
    yearsRunOutOfMoney: 0,
  });

  const {
    // fileName,
    setFileName,
    tables,
    setTables,
    fields,
    setFields,
    clearStore,
  } = useTableStore();
  const router = useRouter();
  const {
    highlightedRows,
    highlightedColumns,
    handleRowClick,
    handleColumnClick,
  } = useTableHighlight();

  useEffect(() => {
    // Only proceed if the session is fully loaded
    if (status === "loading") {
      return; // Wait for session to load
    }

    if (status !== "authenticated" || !session?.user?.id || !fileId) {
      setError("Unauthorized or invalid file ID");
      setLoading(false);
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
        console.log("Fetched data:", data); // Debug
        // Set read-only if file was created by admin
        setIsReadOnly(data.createdByRole === "admin");
        setTables(data.tablesData?.tables || []);

        setTablesDataFields({
          startingBalance: Number(data.tablesData?.startingBalance) || 0,
          annualContributions:
            Number(data.tablesData?.annualContributions) || 0,
          annualEmployerMatch:
            Number(data.tablesData?.annualEmployerMatch) || 0,
          yearsRunOutOfMoney: Number(data.tablesData?.yearsRunOutOfMoney) || 0,
        });

        setFields(data.fields || {});
        setFileName(data.fileName || "");
        setHasFetched(true);
      } catch {
        setError("Error fetching file");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId, session, status, hasFetched, setTables, setFields, setFileName]);

  const saveChanges = debounce(
    async () => {
      if (
        !fileId ||
        status !== "authenticated" ||
        !session?.user?.id ||
        isReadOnly
      ) {
        console.log("Skipping save due to read-only mode or invalid state");
        return;
      }
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tablesData: { tables, ...tablesDataFields },
            fields,
          }),
        });
        if (!response.ok) setError("Failed to save changes");
      } catch {
        setError("Error saving changes");
      }
    },
    1000,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    if (tables.length > 0 || Object.values(fields).some((v) => v !== null))
      saveChanges();
    return () => saveChanges.cancel();
  }, [tables, fields, saveChanges]);

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
      setFileName(selectedFile.name);
      setError(null);
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
        setFields(response.data.fields || {});
        toast(`Extracted ${response.data.tables.length} tables from PDF.`);

        await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tablesData: {
              tables: response.data.tables,
              ...tablesDataFields, // Preserve all fields
            },
            fields: response.data.fields || {},
          }),
        });
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

  const handleCancel = async () => {
    setFile(null);
    setError(null);
    setZoomLevel(1);
    setIsTableFullScreen(false);

    if (fileId && status === "authenticated" && session?.user?.id) {
      try {
        // Clear fields data
        const fieldsResponse = await fetch(`/api/files/${fileId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clearFieldsData" }),
        });

        if (!fieldsResponse.ok) {
          setError("Failed to clear fields data");
          toast("Failed to clear fields data");
          return;
        }

        // Clear tables data
        const tablesResponse = await fetch(`/api/files/${fileId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clearTablesData" }),
        });

        if (!tablesResponse.ok) {
          setError("Failed to clear tables data");
          toast("Failed to clear tables data");
          return;
        }

        clearStore(); // Clear local store after successful API calls
        toast("Data cleared successfully");
      } catch {
        setError("Error clearing data");
        toast("Error clearing data");
      }
    }
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) =>
    setIsScrolled(e.currentTarget.scrollTop > 50);

  const getContrastingTextColor = (bgColor: string): string => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const renderTable = () => (
    <Card className="flex-1 flex flex-col h-[90vh]">
      <CardHeader className="sticky top-0 z-10">
        <h3 className="text-lg font-semibold">Imported Data Preview</h3>
      </CardHeader>
      <CardContent
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
      >
        {isScrolled && tables.length > 0 && (
          <div className="sticky top-0 z-10 bg-white shadow-md w-full flex">
            {tables.map((table, index) => {
              const columns = Object.keys(table.data[0] || {}).filter(
                (key) => key !== "Source_Text" && key !== "Page_Number"
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
                        {columns.map((header) => {
                          const bgColor = highlightedColumns.has(header)
                            ? highlightColor
                            : "#FFFFFF";
                          return (
                            <TableHead
                              key={header}
                              className={cn(
                                "border whitespace-normal break-words min-h-[60px] align-top cursor-pointer"
                              )}
                              style={{
                                width: `${100 / columns.length}%`,
                                backgroundColor: bgColor,
                                color: getContrastingTextColor(bgColor),
                              }}
                              onClick={() => handleColumnClick(header)}
                            >
                              {header}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            transition: "transform 0.3s ease",
            width: "100%",
          }}
          className="relative"
        >
          <div className={tables.length > 2 ? "flex gap-0" : "flex gap-0"}>
            {tables.map((table, index) => {
              const columns = Object.keys(table.data[0] || {}).filter(
                (key) => key !== "Source_Text" && key !== "Page_Number"
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
                        {columns.map((header) => {
                          const bgColor = highlightedColumns.has(header)
                            ? highlightColor
                            : "#FFFFFF";
                          return (
                            <TableHead
                              key={header}
                              className={cn(
                                "border whitespace-normal break-words min-h-[60px] align-top cursor-pointer"
                              )}
                              style={{
                                width: `${100 / columns.length}%`,
                                backgroundColor: bgColor,
                                color: getContrastingTextColor(bgColor),
                              }}
                              onClick={() => handleColumnClick(header)}
                            >
                              {header}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.data.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className={cn("min-h-[60px] cursor-pointer")}
                          style={{
                            backgroundColor: highlightedRows.has(rowIndex)
                              ? highlightColor
                              : "#FFFFFF",
                          }}
                          onClick={() => handleRowClick(rowIndex)}
                        >
                          {columns.map((col) => {
                            const bgColor =
                              highlightedColumns.has(col) ||
                              highlightedRows.has(rowIndex)
                                ? highlightColor
                                : "#FFFFFF";
                            return (
                              <TableCell
                                key={col}
                                className={cn(
                                  "border whitespace-normal break-words align-top"
                                )}
                                style={{
                                  width: `${100 / columns.length}%`,
                                  backgroundColor: bgColor,
                                  color: getContrastingTextColor(bgColor),
                                }}
                              >
                                {row[col] ?? "-"}
                              </TableCell>
                            );
                          })}
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
  );

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
              className="lg:w-[70%] w-full flex h-[90vh]"
            >
              <div className="grow relative">
                {tables.length > 0 && !isTableLoading ? (
                  renderTable()
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
              className="fixed inset-0 z-50 p-4 flex flex-col bg-black"
            >
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold"></h3>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            onClick={handleZoomIn}
                            disabled={
                              isTableLoading || zoomLevel >= 2 || !tables.length
                            }
                            aria-label="Zoom in on table"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{"Zoom in on table"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            onClick={handleZoomOut}
                            disabled={
                              isTableLoading ||
                              zoomLevel <= 0.5 ||
                              !tables.length
                            }
                            aria-label="Zoom out on table"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{"Zoom out on table"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={handleFullScreenToggle}
                            disabled={isTableLoading}
                            aria-label="Exit full-screen mode"
                          >
                            <Minimize2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{"Exit full-screen mode"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {tables.length > 0 && !isTableLoading && renderTable()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="lg:w-[30%] w-full flex flex-col gap-4 lg:mt-auto"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="highlight-color">Highlight Color</Label>
              <input
                id="highlight-color"
                type="color"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="w-8 h-8 border rounded"
              />
            </div>
          </div>
          <div className="space-y-2 flex-col gap-2">
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="illustration-date">
                Illustration Date
              </Label>
              <Input
                className="w-2/4"
                id="illustration-date"
                disabled
                value={fields.illustration_date || ""}
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="insured-name">
                Insured Name
              </Label>
              <Input
                className="w-2/4"
                id="insured-name"
                disabled
                value={fields.insured_name || ""}
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                Assumed ROR
              </Label>
              <Input
                className="w-2/4"
                id="assumed-ror"
                disabled
                value={fields.assumed_ror || ""}
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="minimum-initial-pmt">
                Minimum Initial Pmt
              </Label>
              <Input
                className="w-2/4"
                id="minimum-initial-pmt"
                disabled
                value={fields.minimum_initial_pmt || ""}
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
                onDragOver={isReadOnly ? undefined : handleDragOver}
                onDrop={isReadOnly ? undefined : handleFileChange}
              >
                <p className="text-gray-500 mb-2">
                  {isReadOnly
                    ? "File upload disabled for admin-created files"
                    : "Drop PDF Here or Click to Select"}
                </p>
                <Button asChild disabled={isReadOnly}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    Select File
                    <Upload className="h-4 w-4 high-contrast:text-white!" />
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={isReadOnly} // Disable file input
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
                disabled={isTableLoading || isReadOnly}
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
                className="high-contrast:bg-white high-contrast:text-black"
                variant="default"
                onClick={handleImport}
                disabled={isTableLoading || isReadOnly}
              >
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isTableLoading || isReadOnly}
              >
                Clear
              </Button>
            </motion.div>
          )}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    className="high-contrast:bg-white"
                    variant="outline"
                    onClick={handleZoomIn}
                    disabled={
                      isTableLoading || zoomLevel >= 2 || !tables.length
                    }
                    aria-label="Zoom in on table"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{"Zoom in on table"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    className="high-contrast:bg-white"
                    variant="outline"
                    onClick={handleZoomOut}
                    disabled={
                      isTableLoading || zoomLevel <= 0.5 || !tables.length
                    }
                    aria-label="Zoom out on table"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{"Zoom out on table"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    className="high-contrast:bg-white"
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
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isTableFullScreen
                    ? "Exit full-screen mode"
                    : "Enter full-screen mode"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
