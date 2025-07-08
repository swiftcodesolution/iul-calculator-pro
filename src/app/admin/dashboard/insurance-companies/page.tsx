// src/app/admin/insurance-companies/page.tsx
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
import { Plus, Trash2, Pencil, Link, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface InsuranceCompany {
  id: string;
  name: string;
  website?: string;
  createdAt: string;
}

interface InsuranceCompanyRequest {
  id: string;
  name: string;
  website?: string;
  submittedByUser: { email: string };
  createdAt: string;
}

export default function AdminInsuranceCompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [requests, setRequests] = useState<InsuranceCompanyRequest[]>([]);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesResponse, requestsResponse] = await Promise.all([
          fetch("/api/insurance-companies"),
          fetch("/api/insurance-company-requests"),
        ]);
        if (!companiesResponse.ok) throw new Error("Failed to fetch companies");
        if (!requestsResponse.ok) throw new Error("Failed to fetch requests");
        const companiesData = await companiesResponse.json();
        const requestsData = await requestsResponse.json();
        setCompanies(companiesData);
        setRequests(requestsData);
      } catch (err) {
        setError("Error loading data");
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!name) {
      setError("Name is required");
      return;
    }
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/insurance-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, website }),
      });
      if (!response.ok) throw new Error("Failed to add company");
      const newCompany = await response.json();
      setCompanies([...companies, newCompany]);
      setName("");
      setWebsite("");
      setError(null);
    } catch (err) {
      setError("Error adding company");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editId || !editName) {
      setError("Name is required");
      return;
    }
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/insurance-companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: editName,
          website: editWebsite,
        }),
      });
      if (!response.ok) throw new Error("Failed to edit company");
      const updatedCompany = await response.json();
      setCompanies(
        companies.map((company) =>
          company.id === editId ? updatedCompany : company
        )
      );
      setEditId(null);
      setEditName("");
      setEditWebsite("");
      setOpen(false);
      setError(null);
    } catch (err) {
      setError("Error editing company");
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
      const response = await fetch("/api/insurance-companies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete company");
      setCompanies(companies.filter((company) => company.id !== id));
      setError(null);
    } catch (err) {
      setError("Error deleting company");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/insurance-company-requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete request");
      setRequests(requests.filter((request) => request.id !== id));
      setError(null);
    } catch (err) {
      setError("Error deleting request");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: InsuranceCompanyRequest) => {
    if (session?.user?.role !== "admin") {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/insurance-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: request.name, website: request.website }),
      });
      if (!response.ok) throw new Error("Failed to approve request");
      const newCompany = await response.json();
      setCompanies([...companies, newCompany]);
      await handleDeleteRequest(request.id); // Delete the request after approval
      setError(null);
    } catch (err) {
      setError("Error approving request");
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
          <Plus className="mr-2" /> Manage Insurance Companies
        </h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Add New Insurance Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Website (optional)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <Button onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add Company"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>User Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="high-contrast:text-black">
                      Name
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Website
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Submitted By
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Submitted At
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.name}</TableCell>
                      <TableCell>
                        {request.website ? (
                          <a
                            href={request.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Visit
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{request.submittedByUser.email}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproveRequest(request)}
                            disabled={loading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteRequest(request.id)}
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
              <p>No user requests available.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Insurance Companies List</CardTitle>
          </CardHeader>
          <CardContent>
            {companies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="high-contrast:text-black">
                      Name
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Website
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Created At
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Visit
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(company.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {company.website && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                window.open(company.website, "_blank")
                              }
                              disabled={loading}
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          )}
                          <Dialog
                            open={open && editId === company.id}
                            onOpenChange={setOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditId(company.id);
                                  setEditName(company.name);
                                  setEditWebsite(company.website || "");
                                }}
                                disabled={loading}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Edit Insurance Company
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-4">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Company name"
                                />
                                <Input
                                  value={editWebsite}
                                  onChange={(e) =>
                                    setEditWebsite(e.target.value)
                                  }
                                  placeholder="Website (optional)"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleEdit}
                                    disabled={loading}
                                  >
                                    {loading ? "Saving..." : "Save"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditId(null);
                                      setEditName("");
                                      setEditWebsite("");
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
                            onClick={() => handleDelete(company.id)}
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
              <p>No insurance companies available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
