"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { motion } from "motion/react";
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
import { Input } from "@/components/ui/input"; // Added for input fields
import { Label } from "@/components/ui/label"; // Added for labels
import { Upload } from "lucide-react";
import { toast } from "sonner";

// Define types
type TableData = {
  source_text: string;
  page_number: number;
  data: Record<string, string | number>[];
};

type ApiResponse = {
  tables: TableData[];
  message?: string;
};

// API endpoint
const API_ENDPOINT =
  "https://pdf-extraction-tool-backend-production.up.railway.app/upload-pdf/";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handle file change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    let selectedFile: File | null = null;

    if ("dataTransfer" in e) {
      // Drag-and-drop event
      selectedFile = e.dataTransfer.files?.[0] || null;
    } else {
      // File input event
      selectedFile = e.target.files?.[0] || null;
    }

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
      setTables([]);
    } else {
      setFile(null);
      setError("Please upload a valid PDF file.");
      toast("Please upload a valid PDF file.");
    }
  };

  // Handle upload with API call
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      toast("Please select a PDF file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<ApiResponse>(API_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.tables) {
        console.log(
          "Received tables:",
          JSON.stringify(response.data.tables, null, 2)
        );
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
      setLoading(false);
    }
  };

  // Handle drag-over to allow dropping
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle import (send data to Pages 2 and 4)
  const handleImport = () => {
    if (!tables.length) return;

    console.log("Importing tables:", tables);
    // Placeholder: Send data to Pages 2 and 4
    setFile(null);
    setTables([]);
    setError("");
    toast("Data imported successfully.");
  };

  // Handle cancel (reset form)
  const handleCancel = () => {
    setFile(null);
    setTables([]);
    setError("");
  };

  return (
    <div className="grow h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row gap-4 flex-1"
      >
        {/* Table Area (fixed 70% width on the left, with scrolling for multiple tables) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:w-[70%] w-full overflow-y-auto flex h-[90vh]"
        >
          <div className="grow">
            {tables.length > 0 && !loading && !error ? (
              <>
                <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-white z-10">
                  Imported Data Preview
                </h3>
                {tables.map((table, index) => {
                  const columns = Object.keys(table.data[0] || {}).filter(
                    (key) => key !== "Source_Text" && key !== "Page_Number"
                  );

                  return (
                    <div key={index} className="mb-6">
                      <h4 className="text-md font-medium mb-2">
                        Table from {table.source_text} (Page {table.page_number}
                        )
                      </h4>
                      <Table className="border table-fixed w-full">
                        <TableHeader>
                          <TableRow>
                            {columns.map((header) => (
                              <TableHead
                                key={header}
                                className="border whitespace-normal break-words min-h-[60px] align-top"
                                style={{ width: `${100 / columns.length}%` }}
                              >
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="min-h-[60px]">
                              {columns.map((col) => (
                                <TableCell
                                  key={col}
                                  className="border whitespace-normal break-words align-top"
                                  style={{ width: `${100 / columns.length}%` }}
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

        {/* Upload Area (fixed 30% width on the bottom-right from page load) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="lg:w-[30%] w-full flex flex-col justify-between gap-4 lg:mt-auto"
        >
          {/* Input Fields (Disabled) */}
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
              <Label className="grow" htmlFor="initial-death-benefit">
                Underwriting Class
              </Label>
              <Input
                className="w-2/4"
                id="initial-death-benefit"
                disabled
                placeholder="500000"
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
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                Target Premium
              </Label>
              <Input
                className="w-2/4"
                id="assumed-ror"
                disabled
                placeholder="6.3%"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                7-Pay
              </Label>
              <Input
                className="w-2/4"
                id="assumed-ror"
                disabled
                placeholder="6.3%"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                MEC?
              </Label>
              <Input
                className="w-2/4"
                id="assumed-ror"
                disabled
                placeholder="6.3%"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                GLP
              </Label>
              <Input
                className="w-2/4"
                id="assumed-ror"
                disabled
                placeholder="6.3%"
              />
            </div>
            <div className="space-y-2 flex gap-2">
              <Label className="grow" htmlFor="assumed-ror">
                GSP
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
                disabled={loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Upload"}
              </Button>
            </CardContent>
          </Card>
          {/* Sample Buttons (Do Nothing) */}
          {/* <div className="flex flex-col gap-2">
            <h3 className="text-md font-semibold">Load Sample Data</h3>
            <Button disabled={loading}>Load Sample 1</Button>
            <Button disabled={loading}>Load Sample 2</Button>
          </div> */}
          {/* Error Message */}
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
          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-500"
            >
              Processing...
            </motion.div>
          )}
          {/* Action Buttons */}
          {tables.length > 0 && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex justify-center gap-4"
            >
              <Button
                variant="default"
                onClick={handleImport}
                disabled={loading}
              >
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
