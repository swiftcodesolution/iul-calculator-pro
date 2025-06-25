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
  Download,
  GripVertical,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Identifier, XYCoord } from "dnd-core";

interface Resource {
  id: string;
  fileName: string;
  filePath?: string | null; // Optional to match Prisma schema
  fileFormat?: string | null; // Optional to match Prisma schema
  link?: string | null; // Optional to match Prisma schema
  createdAt: string;
  order: number;
}

const ItemType = "VIDEO_ROW";

interface DraggableRowProps {
  resource: Resource;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  handleView: (url: string) => void;
  handleDownload: (url: string, fileName: string) => void;
  handleEdit: (id: string, fileName: string) => void;
  handleDelete: (id: string) => void;
  loading: boolean;
}

const DraggableRow = ({
  resource,
  index,
  moveRow,
  handleView,
  handleDownload,
  handleEdit,
  handleDelete,
  loading,
}: DraggableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag<
    { index: number },
    void,
    { isDragging: boolean }
  >({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<
    { index: number },
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemType,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <TableRow ref={ref} className={isDragging ? "opacity-50" : ""}>
      <TableCell>
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 mr-2 cursor-move" />
          {resource.filePath ? (
            <a
              href={resource.filePath}
              target="_blank"
              rel="noopener noreferrer"
            >
              {resource.fileName}
            </a>
          ) : resource.link ? (
            <a href={resource.link} target="_blank" rel="noopener noreferrer">
              {resource.fileName}
            </a>
          ) : (
            resource.fileName
          )}
        </div>
      </TableCell>
      <TableCell>{resource.fileFormat || "N/A"}</TableCell>
      <TableCell>Admin</TableCell>
      <TableCell>{new Date(resource.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              handleView(resource.link || resource.filePath || "#")
            }
            disabled={loading || (!resource.filePath && !resource.link)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {resource.filePath && !resource.link && (
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                handleDownload(resource.filePath!, resource.fileName)
              }
              disabled={loading}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
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

export default function AdminTrainingVideosPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [link, setLink] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/training-videos");
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();
      setResources(data);
      setError(null);
    } catch (err) {
      setError("Error loading resources");
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!fileName || (!file && !link)) {
      setError("Video title and either a file or link are required.");
      return;
    }

    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("fileName", fileName);
    if (file) formData.append("file", file);
    if (link) formData.append("link", link);

    try {
      const response = await fetch("/api/training-videos", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload resource");
      const newResource = await response.json();
      setResources([...resources, newResource]);
      setFile(null);
      setFileName("");
      setLink("");
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
      const response = await fetch("/api/training-videos", {
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
      const response = await fetch("/api/training-videos", {
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

  const moveRow = async (dragIndex: number, hoverIndex: number) => {
    const draggedResource = resources[dragIndex];
    const newResources = [...resources];
    newResources.splice(dragIndex, 1);
    newResources.splice(hoverIndex, 0, draggedResource);
    setResources(newResources);

    const orderedIds = newResources.map((resource) => resource.id);
    try {
      const response = await fetch("/api/training-videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) throw new Error("Failed to update order");
    } catch (err) {
      setError("Error updating order");
      console.error(err);
      fetchResources(); // Revert on error
    }
  };

  if (!session || session.user?.role !== "admin") {
    return <div className="text-red-500">Unauthorized</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-h-screen overflow-y-scroll">
        <main className="p-4">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <Upload className="mr-2" /> Manage Training Videos
          </h1>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Upload New Training Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Video Title"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Input
                  type="url"
                  placeholder="Or provide a video link (e.g. YouTube)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <Button onClick={handleUpload} disabled={loading}>
                  {loading ? "Uploading..." : "Upload Video"}
                </Button>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Training Videos List</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={open && !!editId} onOpenChange={setOpen}>
                {resources.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Uploaded At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map((resource, index) => (
                        <DraggableRow
                          key={resource.id}
                          resource={resource}
                          index={index}
                          moveRow={moveRow}
                          handleView={(url) => window.open(url, "_blank")}
                          handleDownload={(url, fileName) => {
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = fileName;
                            a.click();
                          }}
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
    </DndProvider>
  );
}
