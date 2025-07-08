/* eslint-disable @typescript-eslint/no-explicit-any */
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
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface Subscription {
  userId: string;
  status: string;
  planType: string;
  endDate?: string;
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions"); // Assumes new endpoint for all subscriptions
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError("Error loading subscriptions");
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
        {
          metric: "Active Subscriptions",
          value: data.activeSubscriptions || 0,
        },
        { metric: "Trial Users", value: data.trialUsers || 0 },
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
      fetchSubscriptions(),
      fetchStats(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const chartData = {
    labels: stats.map((stat) => stat.metric),
    datasets: [
      {
        label: "Overview Metrics",
        data: stats.map((stat) => stat.value),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl font-bold ">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={loading}
            className="hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-4"
          >
            {error}
          </motion.p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Stats Card with Bar Chart */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <BarChart className="mr-2 text-blue-500" />
              <CardTitle className="text-xl ">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-64 mb-4"
              >
                <Bar data={chartData} options={chartOptions} />
              </motion.div>
              <Link
                href="/admin/dashboard/stats"
                className="text-blue-500 hover:underline mt-4 block font-medium"
              >
                View Detailed Stats
              </Link>
            </CardContent>
          </Card>

          {/* Subscriptions Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <DollarSign className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {subscriptions.length > 0 ? (
                    subscriptions.slice(0, 2).map((sub) => (
                      <TableRow
                        key={sub.userId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm ">
                          {sub.planType} ({sub.status})
                          <br />
                          <span className="">
                            {sub.endDate
                              ? new Date(sub.endDate).toLocaleDateString()
                              : "No end date"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm ">
                        No subscriptions available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/subscriptions"
                className="text-blue-500 hover:underline mt-2 block font-medium"
              >
                Manage Subscriptions
              </Link>
            </CardContent>
          </Card>

          {/* Download Resources Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <Download className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Download Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {downloadResources.length > 0 ? (
                    downloadResources.slice(0, 3).map((resource) => (
                      <TableRow
                        key={resource.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm ">
                          {resource.fileName} ({resource.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm ">
                        No resources available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/download-resources"
                className="text-blue-500 hover:underline mt-4 block font-medium"
              >
                Manage Resources
              </Link>
            </CardContent>
          </Card>

          {/* Training Documents Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <BookOpen className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Training Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {trainingDocuments.length > 0 ? (
                    trainingDocuments.slice(0, 3).map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm ">
                          {doc.fileName} ({doc.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm ">
                        No documents available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/training-documents"
                className="text-blue-500 hover:underline mt-2 block font-medium"
              >
                Manage Documents
              </Link>
            </CardContent>
          </Card>

          {/* Training Videos Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <Video className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Training Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {trainingVideos.length > 0 ? (
                    trainingVideos.slice(0, 3).map((video) => (
                      <TableRow
                        key={video.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm ">
                          {video.fileName} ({video.fileFormat})
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm ">
                        No videos available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/training-videos"
                className="text-blue-500 hover:underline mt-2 block font-medium"
              >
                Manage Videos
              </Link>
            </CardContent>
          </Card>

          {/* Insurance Companies Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <Building className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Insurance Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {insuranceCompanies.length > 0 ? (
                    insuranceCompanies.slice(0, 2).map((company) => (
                      <TableRow
                        key={company.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm ">
                          {company.name}
                          {company.website && (
                            <span className="">
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
                      <TableCell className="text-sm ">
                        No companies available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/insurance-companies"
                className="text-blue-500 hover:underline mt-2 block font-medium"
              >
                Manage Companies
              </Link>
            </CardContent>
          </Card>

          {/* Recent Users Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <Users className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {users.length > 0 ? (
                    users.slice(0, 2).map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm ">
                          {user.firstName} {user.lastName} ({user.role})
                          <br />
                          <span className="">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "No login"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm ">
                        No users available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/users"
                className="text-blue-500 hover:underline mt-2 block font-medium"
              >
                Manage Users
              </Link>
            </CardContent>
          </Card>

          {/* Pro Sample Files Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <FileText className="mr-2 text-blue-500" />
              <CardTitle className="text-lg ">Pro Sample Files</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {downloadResources.length > 0 ? (
                    downloadResources
                      .slice(
                        0,

                        2
                      )
                      .map((file) => (
                        <TableRow
                          key={file.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="text-sm ">
                            {file.fileName} ({file.fileFormat})
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-sm ">
                        No files available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Link
                href="/admin/dashboard/files"
                className="text-blue-500 hover:underline mt-2 block font-medium"
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
