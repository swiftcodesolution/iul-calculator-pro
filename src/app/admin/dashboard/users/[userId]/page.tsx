/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Users, Building2, DollarSign } from "lucide-react";
import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SessionHistory {
  id: string;
  sessionToken: string;
  deviceFingerprint: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  loginAt: string;
  logoutAt: string | null;
}

interface CompanyInfo {
  id: string;
  businessName: string;
  agentName: string;
  email: string;
  phoneNumber: string;
  companyLogo: string | null;
  agentProfilePic: string | null;
}

interface Subscription {
  id: string;
  planType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  iulSales: {
    id: string;
    saleDate: string;
    verified: boolean;
    verifiedAt: string | null;
  }[];
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  cellPhone: string | null;
  officePhone: string | null;
  role: string;
  status: string;
  sessionHistory: SessionHistory[];
  companyInfo: CompanyInfo | null;
  subscription: Subscription | null;
  _count: {
    files: number;
  };
  filesByCategory: { category: string; count: number }[];
  recentFiles: {
    id: string;
    fileName: string;
    category: string;
    createdAt: string;
  }[];
}

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          if (response.status === 404) notFound();
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError("Error loading user details");
        console.error(err);
      }
    }
    fetchUser();
  }, [userId]);

  const handleDeleteUser = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This will remove the user and their associated data."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      router.push("/admin/dashboard/users");
    } catch (err) {
      toast.error("Failed to delete user");
      console.error("Delete user error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      const newStatus = user?.status === "active" ? "suspended" : "active";
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update user status");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(`User ${newStatus} successfully`);
    } catch (err) {
      toast.error("Failed to update user status");
      console.error("Update user status error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const pieData = {
    labels: user?.filesByCategory.map((entry) => entry.category) || [],
    datasets: [
      {
        data: user?.filesByCategory.map((entry) => entry.count) || [],
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

  if (!user && !error) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen overflow-y-scroll">
      <main className="p-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Users className="mr-2 text-blue-500" /> User Details
          </h1>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                Info entered during signup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <p>
                  <strong>Name:</strong>{" "}
                  {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Role:</strong> {user?.role}
                </p>
                <p>
                  <strong>Cell Phone:</strong> {user?.cellPhone || "N/A"}
                </p>
                <p>
                  <strong>Office Phone:</strong> {user?.officePhone || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {user?.status || "N/A"}
                </p>
                <div className="flex space-x-4 items-center">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="hover:bg-red-600"
                  >
                    {isDeleting ? "Deleting..." : "Delete User"}
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus}
                    className="hover:bg-blue-600"
                  >
                    {updatingStatus
                      ? "Updating..."
                      : user?.status === "active"
                      ? "Suspend"
                      : "Activate"}
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building2 className="mr-2 text-blue-500" /> Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.companyInfo ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <p>
                    <strong>Business Name:</strong>{" "}
                    {user.companyInfo.businessName}
                  </p>
                  <p>
                    <strong>Agent Name:</strong> {user.companyInfo.agentName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.companyInfo.email}
                  </p>
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    {user.companyInfo.phoneNumber}
                  </p>
                  {user.companyInfo.companyLogo && (
                    <div>
                      <strong>Company Logo:</strong>
                      <Image
                        src={user.companyInfo.companyLogo}
                        alt="Company Logo"
                        width={100}
                        height={100}
                        className="mt-2 rounded"
                      />
                    </div>
                  )}
                  {user.companyInfo.agentProfilePic && (
                    <div>
                      <strong>Agent Profile Picture:</strong>
                      <Image
                        src={user.companyInfo.agentProfilePic}
                        alt="Agent Profile Picture"
                        width={100}
                        height={100}
                        className="mt-2 rounded"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <p className="">No company information available.</p>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 text-blue-500" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.subscription ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <p>
                    <strong>Plan Type:</strong> {user.subscription.planType}
                  </p>
                  <p>
                    <strong>Status:</strong> {user.subscription.status}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(user.subscription.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {user.subscription.endDate
                      ? new Date(user.subscription.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <div>
                    <strong>IUL Sales:</strong>
                    {user.subscription.iulSales.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sale Date</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Verified At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.subscription.iulSales.map((sale) => (
                            <TableRow
                              key={sale.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell>
                                {new Date(sale.saleDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {sale.verified ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {sale.verifiedAt
                                  ? new Date(
                                      sale.verifiedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="">No IUL sales recorded.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p className="">No subscription information available.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">File Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              user.filesByCategory.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <strong>Total Files:</strong> {user._count.files || 0}
                  </div>
                  <div className="h-64">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                  <div>
                    <strong>Recent Files:</strong>
                    {user.recentFiles?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.recentFiles.map((file) => (
                            <TableRow
                              key={file.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell>{file.fileName}</TableCell>
                              <TableCell>{file.category}</TableCell>
                              <TableCell>
                                {new Date(file.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="">No recent files available.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p className="">No file information available.</p>
              )
            ) : (
              <p className="">User not loaded.</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.sessionHistory && user.sessionHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.sessionHistory.map((session) => (
                    <TableRow key={session.id} className="hover:bg-gray-50">
                      <TableCell>
                        {new Date(session.loginAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {session.browserName && session.browserVersion
                          ? `${session.browserName} ${session.browserVersion}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {session.osName && session.osVersion
                          ? `${session.osName} ${session.osVersion}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{session.ipAddress || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="">No session history available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
