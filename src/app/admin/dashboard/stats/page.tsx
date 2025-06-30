// src/app/stats/page.tsx
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

  if (!stats && !error) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <BarChart className="mr-2" /> Usage Stats
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Active Users Card */}
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.activeUsers}</p>
              <p className="text-sm text-gray-500">
                Users with active sessions
              </p>
            </CardContent>
          </Card>
          {/* Total Files Card */}
          <Card>
            <CardHeader>
              <CardTitle>Total Files Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalFiles}</p>
              <p className="text-sm text-gray-500">Across all categories</p>
            </CardContent>
          </Card>
        </div>
        {/* Files by Category Table */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Files by Category</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableRow key={category.category}>
                      <TableCell>{category.category}</TableCell>
                      <TableCell>{category.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No files available.</p>
            )}
          </CardContent>
        </Card>
        {/* Files by User Table */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Files by User</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.filesPerUser && stats.filesPerUser.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>File Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.filesPerUser.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.userName || "N/A"}</TableCell>
                      <TableCell>{user.userEmail}</TableCell>
                      <TableCell>{user.fileCount}</TableCell>
                      <TableCell>
                        <Link href={`/admin/dashboard/users/${user.userId}`}>
                          view
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No files available.</p>
            )}
          </CardContent>
        </Card>
        {/* Recent Sessions Table */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
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
                    <TableRow key={session.id}>
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
              <p>No recent sessions available.</p>
            )}
          </CardContent>
        </Card>
        {/* Recent File Uploads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent File Uploads</CardTitle>
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
                    <TableRow key={file.id}>
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
              <p>No recent file uploads available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
