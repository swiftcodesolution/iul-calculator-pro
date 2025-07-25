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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Trash2,
  Pencil,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Resource {
  id: string;
  fileName: string;
  filePath: string;
  fileFormat: string;
  createdAt: string;
  sortOrder: number | null;
}

export default function AdminMediaPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch("/api/download-resources");
        if (!response.ok) throw new Error("Failed to fetch resources");
        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError("Error loading resources");
        console.error(err);
      }
    }
    fetchResources();
  }, []);

  const handleUpload = async () => {
    if (!file || !fileName) {
      setError("File and name are required");
      return;
    }
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    try {
      const response = await fetch("/api/download-resources", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload resource");
      const newResource = await response.json();
      setResources([...resources, newResource]);
      setFile(null);
      setFileName("");
      setError(null);
    } catch (err) {
      setError("Error uploading resource");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!editId || !editFileName) {
      setError("File name is required");
      return;
    }
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("id", editId);
    formData.append("fileName", editFileName);

    try {
      const response = await fetch("/api/download-resources", {
        method: "PATCH",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to rename resource");
      const updatedResource = await response.json();
      setResources(
        resources.map((resource) =>
          resource.id === editId ? updatedResource : resource
        )
      );
      setEditId(null);
      setEditFileName("");
      setOpen(false);
      setError(null);
    } catch (err) {
      setError("Error renaming resource");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/download-resources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete resource");
      setResources(resources.filter((resource) => resource.id !== id));
      setError(null);
    } catch (err) {
      setError("Error deleting resource");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/download-resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });
      if (!response.ok) throw new Error("Failed to reorder resource");

      // Refresh resources to reflect new order
      const refreshResponse = await fetch("/api/download-resources");
      if (!refreshResponse.ok) throw new Error("Failed to fetch resources");
      const updatedResources = await refreshResponse.json();
      setResources(updatedResources);
      setError(null);
    } catch (err) {
      setError("Error reordering resource");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user?.role !== "admin") {
    return <div className="text-red-500">Unauthorized</div>;
  }

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Upload className="mr-2" /> Manage Download Resources
        </h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Upload New Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Resource Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Resource"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resources List</CardTitle>
          </CardHeader>
          <CardContent>
            {resources.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="high-contrast:text-black w-20">
                      Order
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      File Name
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Format
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Uploaded By
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Uploaded At
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource, index) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMove(resource.id, "up")}
                            disabled={loading || index === 0} // Disable up for first item
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMove(resource.id, "down")}
                            disabled={loading || index === resources.length - 1} // Disable down for last item
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={resource.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {resource.fileName}
                        </a>
                      </TableCell>
                      <TableCell>{resource.fileFormat}</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>
                        {new Date(resource.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              window.open(resource.filePath, "_blank")
                            }
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={open && editId === resource.id}
                            onOpenChange={setOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditId(resource.id);
                                  setEditFileName(resource.fileName);
                                }}
                                disabled={loading}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rename Resource</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-4">
                                <Input
                                  value={editFileName}
                                  onChange={(e) =>
                                    setEditFileName(e.target.value)
                                  }
                                  placeholder="New resource name"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleRename}
                                    disabled={loading}
                                  >
                                    {loading ? "Saving..." : "Save"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditId(null);
                                      setEditFileName("");
                                      setOpen(false);
                                    }}
                                    disabled={loading}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(resource.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No resources available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
