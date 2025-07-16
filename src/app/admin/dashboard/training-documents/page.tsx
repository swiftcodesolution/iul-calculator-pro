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
  link?: string | null;
  createdAt: string;
  order: number;
  uploadedBy: string;
}

interface ReorderableRowProps {
  resource: Resource;
  index: number;
  moveRowUp: (index: number) => void;
  moveRowDown: (index: number) => void;
  totalRows: number;
  handleView: (url: string) => void;
  handleEdit: (id: string, fileName: string) => void;
  handleDelete: (id: string) => void;
  loading: boolean;
}

const ReorderableRow = ({
  resource,
  index,
  moveRowUp,
  moveRowDown,
  totalRows,
  handleView,
  handleEdit,
  handleDelete,
  loading,
}: ReorderableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center">
          <div className="flex gap-2 mr-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveRowUp(index)}
              disabled={loading || index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveRowDown(index)}
              disabled={loading || index === totalRows - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <a href={resource.filePath} target="_blank" rel="noopener noreferrer">
            {resource.fileName}
          </a>
        </div>
      </TableCell>
      <TableCell>{new Date(resource.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(resource.filePath)}
            disabled={loading}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(resource.id, resource.fileName)}
              disabled={loading}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
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
  );
};

export default function AdminTrainingDocumentsPage() {
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
        const response = await fetch("/api/training-documents");
        if (!response.ok) throw new Error("Failed to fetch resources");
        const data = await response.json();
        const sortedData = data.sort(
          (a: Resource, b: Resource) => a.order - b.order
        );
        setResources(sortedData);
        setError(null);
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
    formData.append(
      "order",
      (resources.length > 0
        ? Math.max(...resources.map((r) => r.order)) + 1
        : 0
      ).toString()
    );

    try {
      const response = await fetch("/api/training-documents", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload resource");
      const newResource = await response.json();
      setResources(
        [...resources, newResource].sort((a, b) => a.order - b.order)
      );
      setFile(null);
      setFileName("");
      setError(null);
    } catch (err) {
      setError("Error uploading resource");
      console.error(err);
    } finally {
      setLoading(false);
      setFile(null);
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
      const response = await fetch("/api/training-documents", {
        method: "PATCH",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to rename resource");
      const updatedResource = await response.json();
      setResources(
        resources
          .map((resource) =>
            resource.id === editId ? updatedResource : resource
          )
          .sort((a, b) => a.order - b.order)
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
      const response = await fetch("/api/training-documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete resource");
      setResources(
        resources
          .filter((resource) => resource.id !== id)
          .sort((a, b) => a.order - b.order)
      );
      setError(null);
    } catch (err) {
      setError("Error deleting resource");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moveRowUp = async (index: number) => {
    if (index === 0) return;
    const newResources = [...resources];
    [newResources[index - 1].order, newResources[index].order] = [
      newResources[index].order,
      newResources[index - 1].order,
    ];
    setResources(newResources.sort((a, b) => a.order - b.order));

    const orderedIds = newResources.map((resource) => resource.id);
    try {
      const response = await fetch("/api/training-documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) throw new Error("Failed to update order");
    } catch (err) {
      setError("Error updating order");
      console.error(err);
    }
  };

  const moveRowDown = async (index: number) => {
    if (index === resources.length - 1) return;
    const newResources = [...resources];
    [newResources[index + 1].order, newResources[index].order] = [
      newResources[index].order,
      newResources[index + 1].order,
    ];
    setResources(newResources.sort((a, b) => a.order - b.order));

    const orderedIds = newResources.map((resource) => resource.id);
    try {
      const response = await fetch("/api/training-documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) throw new Error("Failed to update order");
    } catch (err) {
      setError("Error updating order");
      console.error(err);
    }
  };

  if (!session || session.user?.role !== "admin") {
    return <div className="text-red-500">Unauthorized</div>;
  }

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Upload className="mr-2" /> Manage Training Documents
        </h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Upload New Training Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Document Title"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Document"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Training Documents List</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={open && !!editId} onOpenChange={setOpen}>
              {resources.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="high-contrast:text-black">
                        File Name
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
                      <ReorderableRow
                        key={resource.id}
                        resource={resource}
                        index={index}
                        moveRowUp={moveRowUp}
                        moveRowDown={moveRowDown}
                        totalRows={resources.length}
                        handleView={(url) => window.open(url, "_blank")}
                        handleEdit={(id, fileName) => {
                          setEditId(id);
                          setEditFileName(fileName);
                          setOpen(true);
                        }}
                        handleDelete={handleDelete}
                        loading={loading}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No resources available.</p>
              )}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Resource</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Input
                    value={editFileName}
                    onChange={(e) => setEditFileName(e.target.value)}
                    placeholder="New resource name"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleRename} disabled={loading}>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
