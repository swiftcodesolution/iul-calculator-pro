"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Resource {
  id: string;
  fileName: string;
  filePath: string;
  fileFormat: string;
  createdAt: string;
  sortOrder: number | null;
}

export default function DownloadContentPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/download-resources");
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();

      const sortedResources = data.sort((a: Resource, b: Resource) => {
        if (a.sortOrder == null && b.sortOrder == null) {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        if (a.sortOrder == null) return 1; // Nulls last
        if (b.sortOrder == null) return -1;
        return a.sortOrder - b.sortOrder;
      });

      setResources(sortedResources);
      setError(null);
    } catch (err) {
      setError("Error loading resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="h-[95vh] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <div>
            <Image
              src="/logo.png"
              alt="IUL Pro Logo"
              width={500}
              height={500}
              className="w-[300px] h-[100px] object-contain"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchResources}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Available Files</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : resources.length > 0 ? (
            <div className="h-full overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>{resource.fileName}</TableCell>
                      <TableCell>{resource.fileFormat}</TableCell>
                      <TableCell>
                        {new Date(resource.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(resource.filePath, "_blank")
                            }
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <a
                            href={resource.filePath}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={loading}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>No resources available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
