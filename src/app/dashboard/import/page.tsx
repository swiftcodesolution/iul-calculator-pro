"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";

export default function ImportPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState({
    Date: "",
    "Insured's Name": "",
    "Initial Death Benefit": "",
    "Assumed ROR": "",
  });
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleImport = () => {
    console.log("Import triggered with:", previewData);
  };

  const handleCancel = () => {
    setFileName(null);
  };

  const handleSampleClick = (sample: string) => {
    setSelectedSample(sample);
    setIsSampleDialogOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Import PDF Illustration</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed p-6 mb-4 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Label>Drop PDF Here or</Label>
            <Button asChild className="mt-2">
              <label>
                <Upload className="h-4 w-4 mr-2" /> Select File
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </Button>
            {fileName && <p className="mt-2">Selected: {fileName}</p>}
          </div>

          <div className="mb-4">
            <Label>Imported Data Preview</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(previewData).map(([field, value]) => (
                  <TableRow key={field}>
                    <TableCell>{field}</TableCell>
                    <TableCell>{value || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mb-4">
            <Label>Sample Illustrations</Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSampleClick("Sample 1")}
              >
                Sample 1
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSampleClick("Sample 2")}
              >
                Sample 2
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport}>Import</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSampleDialogOpen} onOpenChange={setIsSampleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSample} Preview</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(previewData).map(([field, value]) => (
                <TableRow key={field}>
                  <TableCell>{field}</TableCell>
                  <TableCell>{value || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
