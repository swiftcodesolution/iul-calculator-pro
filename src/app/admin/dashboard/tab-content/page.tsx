// src/app/admin/tab-content/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Trash2, Pencil, Eye, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface TabContent {
  id: string;
  tabName: string;
  fileName: string | null;
  filePath: string | null;
  fileFormat: string | null;
  link: string | null;
  createdByRole: string;
  userId: string;
  createdAt: string;
  user: {
    firstName: string | null;
    email: string | null;
  } | null; // Include user data
}

export default function AdminTabContentPage() {
  const { data: session } = useSession();
  const [ownTabContent, setOwnTabContent] = useState<TabContent[]>([]);
  const [othersTabContent, setOthersTabContent] = useState<TabContent[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [tabName, setTabName] = useState("");
  const [link, setLink] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTabName, setEditTabName] = useState("");
  const [editLink, setEditLink] = useState("");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContent, setViewContent] = useState<TabContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTabContent() {
      try {
        const response = await fetch("/api/tab-content");
        if (!response.ok) throw new Error("Failed to fetch tab content");
        const data: TabContent[] = await response.json();
        setOwnTabContent(
          data.filter((item) => item.userId === session?.user?.id)
        );
        setOthersTabContent(
          data.filter((item) => item.userId !== session?.user?.id)
        );
      } catch (err) {
        setError("Error loading tab content");
        console.error(err);
      }
    }
    if (session?.user?.id) {
      fetchTabContent();
    }
  }, [session]);

  const handleUpload = async () => {
    if (!tabName || (!file && !link)) {
      setError("Tab name and either file or link are required.");
      return;
    }
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("tabName", tabName);
    if (file) formData.append("file", file);
    if (link) formData.append("link", link);

    try {
      const response = await fetch("/api/tab-content", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload tab content");
      const newTabContent: TabContent = await response.json();
      setOwnTabContent([...ownTabContent, newTabContent]);
      setFile(null);
      setTabName("");
      setLink("");
      setError(null);
    } catch (err) {
      setError("Error uploading tab content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!editId || !editTabName) {
      setError("Tab name is required");
      return;
    }
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("id", editId);
    formData.append("tabName", editTabName);
    if (editLink) formData.append("link", editLink);

    try {
      const response = await fetch("/api/tab-content", {
        method: "PATCH",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to rename tab content");
      const updatedTabContent: TabContent = await response.json();
      setOwnTabContent(
        ownTabContent.map((item) =>
          item.id === editId ? updatedTabContent : item
        )
      );
      setOthersTabContent(
        othersTabContent.map((item) =>
          item.id === editId ? updatedTabContent : item
        )
      );
      setEditId(null);
      setEditTabName("");
      setEditLink("");
      setOpen(false);
      setError(null);
    } catch (err) {
      setError("Error renaming tab content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isOwn: boolean) => {
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tab-content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete tab content");
      if (isOwn) {
        setOwnTabContent(ownTabContent.filter((item) => item.id !== id));
      } else {
        setOthersTabContent(othersTabContent.filter((item) => item.id !== id));
      }
      setError(null);
    } catch (err) {
      setError("Error deleting tab content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (fileFormat: string | null, link: string | null) => {
    if (link) {
      return "/icons/link.png";
    }
    if (!fileFormat) return "/icons/file.png";
    if (fileFormat.startsWith("image/")) return fileFormat;
    if (fileFormat === "application/pdf") return "/icons/pdf.png";
    if (fileFormat.startsWith("video/")) return "/icons/video.png";
    if (
      fileFormat.includes("msword") ||
      fileFormat.includes("wordprocessingml")
    )
      return "/icons/doc.png";
    if (fileFormat.includes("excel") || fileFormat.includes("spreadsheetml"))
      return "/icons/xls.png";
    if (
      fileFormat.includes("powerpoint") ||
      fileFormat.includes("presentationml")
    )
      return "/icons/ppt.png";
    return "/icons/file.png";
  };

  const getEmbedUrl = (link: string | null) => {
    if (!link) return null;
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      const videoId = link.includes("youtube.com")
        ? new URL(link).searchParams.get("v")
        : link.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return link;
  };

  if (!session || session.user.role !== "admin") {
    return <div className="text-red-500">Unauthorized</div>;
  }

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Upload className="mr-2" /> Manage Tab Content
        </h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Upload New Tab Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Tab Name"
                value={tabName}
                onChange={(e) => setTabName(e.target.value)}
              />
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Input
                type="url"
                placeholder="Or provide a link (e.g., YouTube)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Tab Content"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Your Tab Content</CardTitle>
          </CardHeader>
          <CardContent>
            {ownTabContent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ownTabContent.map((item) => {
                  const iconSrc = getIcon(item.fileFormat, item.link);
                  return (
                    <Card
                      key={item.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24 mb-2">
                            {item.fileFormat?.startsWith("image/") &&
                            !item.link ? (
                              <Image
                                src={item.filePath!}
                                alt={item.tabName}
                                fill
                                className="object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = "/icons/image.png";
                                }}
                              />
                            ) : (
                              <Image
                                src={iconSrc}
                                alt={item.tabName}
                                fill
                                className="object-contain rounded"
                              />
                            )}
                          </div>
                          <h3 className="text-sm font-semibold truncate w-full text-center">
                            {item.tabName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate w-full text-center">
                            {item.fileName || item.link || "No file"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>

                          <p className="text-xs text-gray-500">
                            Email: {item.user?.email || "N/A"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Dialog
                              open={viewOpen && viewContent?.id === item.id}
                              onOpenChange={setViewOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setViewContent(item)}
                                  disabled={loading}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{item.tabName}</DialogTitle>
                                </DialogHeader>
                                <p>By: {item.user?.firstName || "Unknown"}</p>
                                <p>Email: {item.user?.email || "N/A"}</p>
                                {item.link && getEmbedUrl(item.link) ? (
                                  <iframe
                                    src={getEmbedUrl(item.link)!}
                                    className="w-full h-96"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                  />
                                ) : item.filePath ? (
                                  item.fileFormat?.startsWith("image/") ? (
                                    <Image
                                      src={item.filePath}
                                      alt={item.tabName}
                                      width={600}
                                      height={400}
                                      className="object-contain"
                                    />
                                  ) : (
                                    <a
                                      href={item.filePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 underline"
                                    >
                                      Open File
                                    </a>
                                  )
                                ) : (
                                  <p>No content available</p>
                                )}
                              </DialogContent>
                            </Dialog>
                            {item.filePath && !item.link && (
                              <a
                                href={item.filePath}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={loading}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            <Dialog
                              open={open && editId === item.id}
                              onOpenChange={setOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditId(item.id);
                                    setEditTabName(item.tabName);
                                    setEditLink(item.link || "");
                                  }}
                                  disabled={loading}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rename Tab Content</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col gap-4">
                                  <Input
                                    value={editTabName}
                                    onChange={(e) =>
                                      setEditTabName(e.target.value)
                                    }
                                    placeholder="New tab name"
                                  />
                                  <Input
                                    type="url"
                                    value={editLink}
                                    onChange={(e) =>
                                      setEditLink(e.target.value)
                                    }
                                    placeholder="Update link (e.g., YouTube)"
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
                                        setEditTabName("");
                                        setEditLink("");
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
                              onClick={() => handleDelete(item.id, true)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p>No tab content available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other Users Tab Content</CardTitle>
          </CardHeader>
          <CardContent>
            {othersTabContent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {othersTabContent.map((item) => {
                  const iconSrc = getIcon(item.fileFormat, item.link);
                  return (
                    <Card
                      key={item.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24 mb-2">
                            {item.fileFormat?.startsWith("image/") &&
                            !item.link ? (
                              <Image
                                src={item.filePath!}
                                alt={item.tabName}
                                fill
                                className="object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = "/icons/image.png";
                                }}
                              />
                            ) : (
                              <Image
                                src={iconSrc}
                                alt={item.tabName}
                                fill
                                className="object-contain rounded"
                              />
                            )}
                          </div>
                          <h3 className="text-sm font-semibold truncate w-full text-center">
                            {item.tabName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate w-full text-center">
                            {item.fileName || item.link || "No file"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Role: {item.createdByRole}
                          </p>
                          <p className="text-xs text-gray-500">
                            By: {item.user?.firstName || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Email: {item.user?.email || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Dialog
                              open={viewOpen && viewContent?.id === item.id}
                              onOpenChange={setViewOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setViewContent(item)}
                                  disabled={loading}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{item.tabName}</DialogTitle>
                                </DialogHeader>
                                <p>By: {item.user?.firstName || "Unknown"}</p>
                                <p>Email: {item.user?.email || "N/A"}</p>
                                {item.link && getEmbedUrl(item.link) ? (
                                  <iframe
                                    src={getEmbedUrl(item.link)!}
                                    className="w-full h-96"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                  />
                                ) : item.filePath ? (
                                  item.fileFormat?.startsWith("image/") ? (
                                    <Image
                                      src={item.filePath}
                                      alt={item.tabName}
                                      width={600}
                                      height={400}
                                      className="object-contain"
                                    />
                                  ) : (
                                    <a
                                      href={item.filePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 underline"
                                    >
                                      Open File
                                    </a>
                                  )
                                ) : (
                                  <p>No content available</p>
                                )}
                              </DialogContent>
                            </Dialog>
                            {item.filePath && !item.link && (
                              <a
                                href={item.filePath}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={loading}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            <Dialog
                              open={open && editId === item.id}
                              onOpenChange={setOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditId(item.id);
                                    setEditTabName(item.tabName);
                                    setEditLink(item.link || "");
                                  }}
                                  disabled={loading}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rename Tab Content</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col gap-4">
                                  <Input
                                    value={editTabName}
                                    onChange={(e) =>
                                      setEditTabName(e.target.value)
                                    }
                                    placeholder="New tab name"
                                  />
                                  <Input
                                    type="url"
                                    value={editLink}
                                    onChange={(e) =>
                                      setEditLink(e.target.value)
                                    }
                                    placeholder="Update link (e.g., YouTube)"
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
                                        setEditTabName("");
                                        setEditLink("");
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
                              onClick={() => handleDelete(item.id, false)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p>No tab content available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
