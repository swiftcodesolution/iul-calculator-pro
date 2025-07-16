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
  link?: string | null;
  createdAt: string;
  order: number;
  uploadedBy: string;
}

export default function TrainingContentPage() {
  const [videos, setVideos] = useState<Resource[]>([]);
  const [documents, setDocuments] = useState<Resource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTrainingVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/training-videos");
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();
      const sortedData = data.sort(
        (a: Resource, b: Resource) => a.order - b.order
      );
      setVideos(sortedData);
      setError(null);
    } catch (err) {
      setError("Error loading resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/training-documents");
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();
      const sortedData = data.sort(
        (a: Resource, b: Resource) => a.order - b.order
      );
      setDocuments(sortedData);
      setError(null);
    } catch (err) {
      setError("Error loading resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingVideos();
    fetchTrainingDocuments();
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
          onClick={() => {
            fetchTrainingVideos();
            fetchTrainingDocuments();
          }}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="flex gap-4 h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Videos - For Training & Clients</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : videos.length > 0 ? (
              <div className="h-full overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 high-contrast:bg-white z-10">
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Uploaded At</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <a
                            href={resource.link || resource.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resource.fileName}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(resource.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  resource.link || resource.filePath,
                                  "_blank"
                                )
                              }
                              disabled={loading}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {!resource.link && (
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
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p>No videos available.</p>
            )}
          </CardContent>
        </Card>
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Available Training Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : documents.length > 0 ? (
              <div className="h-full overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 high-contrast:bg-white z-10">
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Uploaded At</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <a
                            href={resource.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resource.fileName}
                          </a>
                        </TableCell>
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
              <p>No documents available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
