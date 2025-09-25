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
import { Users, Building2, DollarSign, File, Eye, EyeOff } from "lucide-react";
import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  foreverFree: boolean;
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
  const [updatingForeverFree, setUpdatingForeverFree] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Reusable function to fetch full user data
  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) notFound();
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
      setNewEmail(data.email); // Update email input with latest email
      setError(null);
    } catch (err) {
      setError("Error loading user details");
      console.error(err);
    }
  };

  /*
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
        setNewEmail(data.email); // Initialize with current email
      } catch (err) {
        setError("Error loading user details");
        console.error(err);
      }
    }
    fetchUser();
  }, [userId]);
  */

  useEffect(() => {
    fetchUser();
  }, [userId]);

  /*
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
  */

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

  /*
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
      toast.success(
        `User ${
          newStatus === "active" ? "activated" : "suspended"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to update user status");
      console.error("Update status error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };
  */

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

      // Refetch full user data
      await fetchUser();
      toast.success(
        `User ${
          newStatus === "active" ? "activated" : "suspended"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to update user status");
      console.error("Update status error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*
  const handleUpdateForeverFree = async (checked: boolean) => {
    setUpdatingForeverFree(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: user?.status, foreverFree: checked }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update forever free status");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(
        `User ${checked ? "marked" : "unmarked"} as forever free successfully`
      );
    } catch (err) {
      toast.error("Failed to update forever free status");
      console.error("Update forever free error:", err);
    } finally {
      setUpdatingForeverFree(false);
    }
  };
  */

  const handleUpdateForeverFree = async (checked: boolean) => {
    setUpdatingForeverFree(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: user?.status, foreverFree: checked }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update forever free status");
      }

      // Refetch full user data
      await fetchUser();
      toast.success(
        `User ${checked ? "marked" : "unmarked"} as forever free successfully`
      );
    } catch (err) {
      toast.error("Failed to update forever free status");
      console.error("Update forever free error:", err);
    } finally {
      setUpdatingForeverFree(false);
    }
  };

  /*
  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Enter a valid email address");
      return;
    }

    setUpdatingEmail(true);
    try {
      const response = await fetch(`/api/users/${userId}/update-email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update email");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success("Email updated successfully");
    } catch (err) {
      toast.error("Failed to update email");
      console.error("Update email error:", err);
    } finally {
      setUpdatingEmail(false);
    }
  };
  */

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Enter a valid email address");
      return;
    }

    setUpdatingEmail(true);
    try {
      const response = await fetch(`/api/users/${userId}/update-email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update email");
      }

      // Refetch full user data
      await fetchUser();
      toast.success("Email updated successfully");
    } catch (err) {
      toast.error("Failed to update email");
      console.error("Update email error:", err);
    } finally {
      setUpdatingEmail(false);
    }
  };

  /*
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error("Password is required");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch(`/api/users/${userId}/update-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update password");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success("Password updated successfully");
      setNewPassword(""); // Clear password field
    } catch (err) {
      toast.error("Failed to update password");
      console.error("Update password error:", err);
    } finally {
      setUpdatingPassword(false);
    }
  };
  */

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error("Password is required");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch(`/api/users/${userId}/update-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update password");
      }

      // Refetch full user data
      await fetchUser();
      toast.success("Password updated successfully");
      setNewPassword(""); // Clear password field
    } catch (err) {
      toast.error("Failed to update password");
      console.error("Update password error:", err);
    } finally {
      setUpdatingPassword(false);
    }
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
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                    />
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={updatingEmail}
                      className="hover:bg-blue-600"
                    >
                      {updatingEmail ? "Updating..." : "Update Email"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="flex space-x-2">
                    {/* input + toggle wrapper */}
                    <div className="relative w-full">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* update password button */}
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword}
                      className="hover:bg-blue-600"
                    >
                      {updatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="foreverFree"
                    checked={user?.foreverFree || false}
                    onCheckedChange={handleUpdateForeverFree}
                    disabled={updatingForeverFree}
                  />
                  <label
                    htmlFor="foreverFree"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Forever Free
                  </label>
                </div>
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
                      ? "Suspend User & Subscription"
                      : "Activate User & Subscription"}
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
                <p>No company information available.</p>
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
                            <TableRow key={sale.id}>
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
                      <p>No IUL sales recorded.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p>No subscription information available.</p>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">File Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <strong>Total Files:</strong> {user._count.files || 0}
                  </div>
                  <div>
                    <strong>File Categories:</strong>
                    {user.filesByCategory?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {user.filesByCategory.map((entry, index) => (
                          <motion.div
                            key={entry.category}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center space-x-2">
                              <File className="h-6 w-6 text-blue-500" />
                              <div>
                                <h3 className="text-md font-semibold">
                                  {entry.category}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {entry.count}{" "}
                                  {entry.count === 1 ? "file" : "files"}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p>No file categories available.</p>
                    )}
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
                            <TableRow key={file.id}>
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
                      <p>No recent files available.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p>User not loaded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
