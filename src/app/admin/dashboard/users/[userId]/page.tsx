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
import { Users, Building2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  cellPhone: string | null;
  officePhone: string | null;
  role: string;
  sessionHistory: SessionHistory[];
  companyInfo: CompanyInfo | null;
}

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
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

  const handleRemoveDevice = async () => {
    if (
      !confirm(
        "Are you sure you want to remove this device? This will clear the device fingerprint for the user."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to remove device");
      }

      toast.success("Device removed successfully");
      // Optionally refetch user data to update the UI
      const updatedResponse = await fetch(`/api/users/${userId}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setUser(updatedData);
      }
    } catch (err) {
      toast.error("Failed to remove device");
      console.error("Remove device error:", err);
    }
  };

  if (!user && !error) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Users className="mr-2" /> User Details
        </h1>
        {/* User Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
              <div className="flex space-x-4">
                <p className="text-blue-500 hover:underline">
                  <Link href="/admin/dashboard/users">Back to Users</Link>
                </p>
                <Button
                  variant="destructive"
                  onClick={handleRemoveDevice}
                  className="ml-4"
                >
                  Remove Device
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Company Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2" /> Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.companyInfo ? (
              <div className="space-y-4">
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
                  <strong>Phone Number:</strong> {user.companyInfo.phoneNumber}
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
              </div>
            ) : (
              <p>No company information available.</p>
            )}
          </CardContent>
        </Card>
        {/* Session History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.sessionHistory && user.sessionHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Logout Time</TableHead>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.sessionHistory.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.loginAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {session.logoutAt
                          ? new Date(session.logoutAt).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{session.deviceType || "N/A"}</TableCell>
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
              <p>No session history available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
