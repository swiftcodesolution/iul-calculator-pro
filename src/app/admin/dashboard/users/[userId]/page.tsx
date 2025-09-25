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
  const [newCellPhone, setNewCellPhone] = useState("");
  const [newOfficePhone, setNewOfficePhone] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updatingCellPhone, setUpdatingCellPhone] = useState(false);
  const [updatingOfficePhone, setUpdatingOfficePhone] = useState(false);
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
      setNewCellPhone(data.cellPhone || "");
      setNewOfficePhone(data.officePhone || "");
      setError(null);
    } catch (err) {
      setError("Error loading user details");
      console.error(err);
    }
  };

  useEffect(() => {
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

  const handleUpdateCellPhone = async () => {
    setUpdatingCellPhone(true);
    try {
      const response = await fetch(`/api/users/${userId}/update-cell-phone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellPhone: newCellPhone }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update cell phone");
      }

      // Refetch full user data
      await fetchUser();
      toast.success("Cell phone updated successfully");
    } catch (err) {
      toast.error("Failed to update cell phone");
      console.error("Update cell phone error:", err);
    } finally {
      setUpdatingCellPhone(false);
    }
  };

  const handleUpdateOfficePhone = async () => {
    setUpdatingOfficePhone(true);
    try {
      const response = await fetch(`/api/users/${userId}/update-office-phone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officePhone: newOfficePhone }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update office phone");
      }

      // Refetch full user data
      await fetchUser();
      toast.success("Office phone updated successfully");
    } catch (err) {
      toast.error("Failed to update office phone");
      console.error("Update office phone error:", err);
    } finally {
      setUpdatingOfficePhone(false);
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
          <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl font-semibold">
                Signup Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage user details and update account settings.
              </p>
            </CardHeader>

            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="space-y-6"
              >
                {/* Basic Info */}
                <div className="grid gap-2">
                  <p>
                    <strong>Name:</strong>{" "}
                    {`${user?.firstName || ""} ${
                      user?.lastName || ""
                    }`.trim() || "N/A"}
                  </p>
                  <p>
                    <strong>Role:</strong> {user?.role}
                  </p>
                  <p>
                    <strong>Status:</strong> {user?.status || "N/A"}
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
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
                      {updatingEmail ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="flex gap-2">
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword}
                      className="hover:bg-blue-600"
                    >
                      {updatingPassword ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cellPhone">Cell Phone</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cellPhone"
                        value={newCellPhone}
                        onChange={(e) => setNewCellPhone(e.target.value)}
                        placeholder="Enter new cell phone"
                      />
                      <Button
                        onClick={handleUpdateCellPhone}
                        disabled={updatingCellPhone}
                        className="hover:bg-blue-600"
                      >
                        {updatingCellPhone ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="officePhone">Office Phone</Label>
                    <div className="flex gap-2">
                      <Input
                        id="officePhone"
                        value={newOfficePhone}
                        onChange={(e) => setNewOfficePhone(e.target.value)}
                        placeholder="Enter new office phone"
                      />
                      <Button
                        onClick={handleUpdateOfficePhone}
                        disabled={updatingOfficePhone}
                        className="hover:bg-blue-600"
                      >
                        {updatingOfficePhone ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="foreverFree"
                    checked={user?.foreverFree || false}
                    onCheckedChange={handleUpdateForeverFree}
                    disabled={updatingForeverFree}
                  />
                  <Label
                    htmlFor="foreverFree"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Forever Free
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
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

          <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <Building2 className="mr-2 text-blue-500" /> Company Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Details about the associated business and agent.
              </p>
            </CardHeader>

            <CardContent>
              {user?.companyInfo ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-6"
                >
                  {/* Company Details */}
                  <div className="grid gap-2">
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
                  </div>

                  {/* Logos and Images */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {user.companyInfo.companyLogo && (
                      <div>
                        <Label className="mb-2 block">Company Logo</Label>
                        <Image
                          src={user.companyInfo.companyLogo}
                          alt="Company Logo"
                          width={120}
                          height={120}
                          className="rounded-lg border shadow-sm w-full h-[120px] object-contain bg-black"
                        />
                      </div>
                    )}

                    {user.companyInfo.agentProfilePic && (
                      <div>
                        <Label className="mb-2 block">
                          Agent Profile Picture
                        </Label>
                        <Image
                          src={user.companyInfo.agentProfilePic}
                          alt="Agent Profile Picture"
                          width={120}
                          height={120}
                          className="rounded-lg border shadow-sm w-[120px] h-[120px] object-contain bg-black"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p className="text-muted-foreground italic">
                  No company information available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <DollarSign className="mr-2 text-blue-500" /> Subscription
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current plan and sales activity.
              </p>
            </CardHeader>

            <CardContent>
              {user?.subscription ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-6"
                >
                  {/* Subscription Details */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <p>
                      <strong>Plan Type:</strong> {user.subscription.planType}
                    </p>
                    <p>
                      <strong>Status:</strong> {user.subscription.status}
                    </p>
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(
                        user.subscription.startDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {user.subscription.endDate
                        ? new Date(
                            user.subscription.endDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* IUL Sales */}
                  <div className="space-y-3">
                    <h4 className="text-base font-medium">IUL Sales</h4>
                    {user.subscription.iulSales.length > 0 ? (
                      <div className="rounded-lg border overflow-x-auto">
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
                                  {sale.verified ? (
                                    <span className="text-green-600 font-medium">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="text-red-500 font-medium">
                                      No
                                    </span>
                                  )}
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
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No IUL sales recorded.
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p className="text-muted-foreground italic">
                  No subscription information available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl font-semibold">
                File Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Overview of uploaded files, categories, and recent activity.
              </p>
            </CardHeader>

            <CardContent>
              {user ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-8"
                >
                  {/* Total Files */}
                  <div>
                    <p className="text-base">
                      <strong>Total Files:</strong> {user._count.files || 0}
                    </p>
                  </div>

                  {/* File Categories */}
                  <div>
                    <h4 className="text-base font-medium mb-3">
                      File Categories
                    </h4>
                    {user.filesByCategory?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.filesByCategory.map((entry, index) => (
                          <motion.div
                            key={entry.category}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center space-x-3">
                              <File className="h-6 w-6 text-blue-500 shrink-0" />
                              <div>
                                <h3 className="text-md font-semibold">
                                  {entry.category}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {entry.count}{" "}
                                  {entry.count === 1 ? "file" : "files"}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No file categories available.
                      </p>
                    )}
                  </div>

                  {/* Recent Files */}
                  <div>
                    <h4 className="text-base font-medium mb-3">Recent Files</h4>
                    {user.recentFiles?.length > 0 ? (
                      <div className="rounded-lg border overflow-x-auto">
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
                                <TableCell className="font-medium">
                                  {file.fileName}
                                </TableCell>
                                <TableCell>{file.category}</TableCell>
                                <TableCell>
                                  {new Date(file.createdAt).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No recent files available.
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <p className="text-muted-foreground italic">User not loaded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
