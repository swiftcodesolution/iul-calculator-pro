/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  BarChart,
  Download,
  Video,
  BookOpen,
  RefreshCw,
  Building,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Resource {
  id: string;
  fileName: string;
  fileFormat: string;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lastLogin?: string;
}

interface Stat {
  metric: string;
  value: number;
}

interface InsuranceCompany {
  id: string;
  name: string;
  website?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [downloadResources, setDownloadResources] = useState<Resource[]>([]);
  const [trainingDocuments, setTrainingDocuments] = useState<Resource[]>([]);
  const [trainingVideos, setTrainingVideos] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<
    InsuranceCompany[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchResources = async (
    endpoint: string,
    setter: (data: any[]) => void
  ) => {
    try {
      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const data = await response.json();
      setter(data);
    } catch (err) {
      setError(`Error loading ${endpoint}`);
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Error loading users");
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats([
        { metric: "Active Users", value: data.activeUsers },
        { metric: "Total Files", value: data.totalFiles },
        { metric: "Recent Downloads", value: data.downloads || 0 },
        { metric: "New Users (30d)", value: data.newUsers || 0 },
      ]);
    } catch (err) {
      setError("Error loading stats");
      console.error(err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      fetchResources("download-resources", setDownloadResources),
      fetchResources("training-documents", setTrainingDocuments),
      fetchResources("training-videos", setTrainingVideos),
      fetchResources("insurance-companies", setInsuranceCompanies),
      fetchUsers(),
      fetchStats(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <div className="flex-1">
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Stats Card */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="flex items-center">
              <BarChart className="mr-2" />
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-lg font-semibold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.metric}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/dashboard/stats"
                className="text-blue-500 hover:underline mt-4 block"
              >
                View Detailed Stats
              </Link>
            </CardContent>
          </Card>

          {/* Download Resources Card */}
          <Card>
            <CardHeader className="flex items-center">
              <Download className="mr-2" />
              <CardTitle>Download Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {downloadResources.length > 0 ? (
                    downloadResources.slice(0, 3).map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="text-sm">
                          {resource.fileName} ({resource.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm">
                        No resources available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/downloads-content"
                className="text-blue-500 hover:underline mt-4 block"
              >
                Manage Resources
              </Link>
            </CardContent>
          </Card>

          {/* Training Documents Card */}
          <Card>
            <CardHeader className="flex items-center">
              <BookOpen className="mr-2" />
              <CardTitle>Training Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {trainingDocuments.length > 0 ? (
                    trainingDocuments.slice(0, 3).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-sm">
                          {doc.fileName} ({doc.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm">
                        No documents available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/training-documents"
                className="text-blue-500 hover:underline mt-2 block"
              >
                Manage Documents
              </Link>
            </CardContent>
          </Card>

          {/* Training Videos Card */}
          <Card>
            <CardHeader className="flex items-center">
              <Video className="mr-2" />
              <CardTitle>Training Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {trainingVideos.length > 0 ? (
                    trainingVideos.slice(0, 3).map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="text-sm">
                          {video.fileName} ({video.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm">
                        No videos available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/training-videos"
                className="text-blue-500 hover:underline mt-2 block"
              >
                Manage Videos
              </Link>
            </CardContent>
          </Card>

          {/* Insurance Companies Card */}
          <Card>
            <CardHeader className="flex items-center">
              <Building className="mr-2" />
              <CardTitle>Insurance Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {insuranceCompanies.length > 0 ? (
                    insuranceCompanies.slice(0, 2).map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="text-sm">
                          {company.name}
                          {company.website && (
                            <span className="text-gray-500">
                              <br />
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Website
                              </a>
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm">
                        No companies available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/insurance-companies"
                className="text-blue-500 hover:underline mt-2 block"
              >
                Manage Companies
              </Link>
            </CardContent>
          </Card>

          {/* Recent Users Card */}
          <Card>
            <CardHeader className="flex items-center">
              <Users className="mr-2" />
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {users.length > 0 ? (
                    users.slice(0, 2).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-sm">
                          {user.firstName} {user.lastName} ({user.role})
                          <br />
                          <span className="text-gray-500">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "No login"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm">
                        No users available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/users"
                className="text-blue-500 hover:underline mt-2 block"
              >
                Manage Users
              </Link>
            </CardContent>
          </Card>

          {/* Pro Sample Files Card */}
          <Card>
            <CardHeader className="flex items-center">
              <FileText className="mr-2" />
              <CardTitle>Pro Sample Files</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {downloadResources.length > 0 ? (
                    downloadResources.slice(0, 2).map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="text-sm">
                          {file.fileName} ({file.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm">
                        No files available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/files"
                className="text-blue-500 hover:underline mt-2 block"
              >
                Manage Files
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
