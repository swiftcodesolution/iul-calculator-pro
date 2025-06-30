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
import { BarChart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface Stats {
  activeUsers: number;
  totalFiles: number;
  filesByCategory: { category: string; count: number }[];
  filesPerUser: {
    userId: string;
    userEmail: string;
    userName: string;
    fileCount: number;
  }[];
  recentSessions: {
    id: string;
    userEmail: string;
    loginAt: string;
    osName: string | null;
    browserName: string | null;
  }[];
  recentFiles: {
    id: string;
    fileName: string;
    userEmail: string;
    category: string;
    createdAt: string;
  }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError("Error loading stats");
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  const pieData = {
    labels: stats?.filesByCategory.map((entry) => entry.category) || [],
    datasets: [
      {
        data: stats?.filesByCategory.map((entry) => entry.count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(34, 197, 94, 0.5)",
          "rgba(249, 115, 22, 0.5)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(249, 115, 22, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
  };

  const barData = {
    labels: stats?.filesPerUser.map((user) => user.userEmail) || [],
    datasets: [
      {
        label: "Files per User",
        data: stats?.filesPerUser.map((user) => user.fileCount) || [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (!stats && !error) {
    return <div className="text-center ">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen overflow-y-scroll">
      <main className="p-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6 flex items-center ">
            <BarChart className="mr-2 text-blue-500" /> Usage Stats
          </h1>
        </motion.div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg ">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-500">
                    {stats?.activeUsers}
                  </p>
                  <p className="text-sm ">Users with active sessions</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg ">
                    Total Files Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-500">
                    {stats?.totalFiles}
                  </p>
                  <p className="text-sm ">Across all categories</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="categories">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg ">Files by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="h-64 mb-4"
                >
                  <Pie data={pieData} options={pieOptions} />
                </motion.div>
                {stats?.filesByCategory && stats.filesByCategory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>File Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.filesByCategory.map((category) => (
                        <TableRow
                          key={category.category}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>{category.category}</TableCell>
                          <TableCell>{category.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="">No files available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg ">Files by User</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="h-64 mb-4"
                >
                  <Bar data={barData} options={barOptions} />
                </motion.div>
                {stats?.filesPerUser && stats.filesPerUser.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>File Count</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.filesPerUser.map((user) => (
                        <TableRow
                          key={user.userId}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>{user.userName || "N/A"}</TableCell>
                          <TableCell>{user.userEmail}</TableCell>
                          <TableCell>{user.fileCount}</TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/dashboard/users/${user.userId}`}
                              className="text-blue-500 hover:underline"
                            >
                              view
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="">No files available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity">
            <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg ">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentSessions && stats.recentSessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Login Time</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Browser</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentSessions.map((session) => (
                        <TableRow key={session.id} className="hover:bg-gray-50">
                          <TableCell>{session.userEmail}</TableCell>
                          <TableCell>
                            {new Date(session.loginAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{session.osName || "N/A"}</TableCell>
                          <TableCell>{session.browserName || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="">No recent sessions available.</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg ">Recent File Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentFiles && stats.recentFiles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentFiles.map((file) => (
                        <TableRow key={file.id} className="hover:bg-gray-50">
                          <TableCell>{file.fileName}</TableCell>
                          <TableCell>{file.userEmail}</TableCell>
                          <TableCell>{file.category}</TableCell>
                          <TableCell>
                            {new Date(file.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="">No recent file uploads available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
