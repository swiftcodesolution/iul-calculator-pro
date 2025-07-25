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
  DollarSign,
  RefreshCw,
  ArrowUpDown,
  Search,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId: string;
  planType: string;
  status: string;
  startDate: string;
  renewalDate?: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    cellPhone?: string;
    officePhone?: string;
    role: string;
    status: string;
  };
  companyInfo?: {
    businessName: string;
    agentName: string;
    phone: string;
    email: string;
  };
}

interface SubscriptionApiResponse {
  userId: string;
  status: string;
  planType: string;
  endDate?: string;
  userEmail: string;
  userName: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    Subscription[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch initial subscription data from /api/subscriptions
      const response = await fetch("/api/subscriptions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscriptions: ${response.statusText}`
        );
      }
      const data: SubscriptionApiResponse[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: Expected an array");
      }

      // Enrich subscriptions with additional user and company data
      const enrichedSubscriptions: Subscription[] = await Promise.all(
        data.map(async (sub) => {
          const userDetails = await fetchUserDetails(sub.userId);
          const [firstName, ...lastNameParts] = (sub.userName || "").split(" ");
          return {
            id: userDetails.subscription?.id || `sub_${sub.userId}`,
            userId: sub.userId,
            stripeCustomerId: undefined, // Not provided by either API
            stripeSubscriptionId:
              userDetails.subscription?.id || `sub_${sub.userId}`,
            planType: sub.planType,
            status: sub.status,
            startDate:
              userDetails.subscription?.startDate || new Date().toISOString(),
            renewalDate: sub.endDate,
            user: {
              id: sub.userId,
              email: sub.userEmail,
              firstName: firstName || undefined,
              lastName: lastNameParts.join(" ") || undefined,
              cellPhone: userDetails.cellPhone,
              officePhone: userDetails.officePhone,
              role: userDetails.role || "user", // Ensure role is string
              status: userDetails.status || "unknown", // Ensure status is string
            },
            companyInfo: userDetails.companyInfo,
          };
        })
      );

      setSubscriptions(enrichedSubscriptions);
      setFilteredSubscriptions(enrichedSubscriptions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscriptions"
      );
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch additional user and subscription details from /api/users/[userId]
  const fetchUserDetails = async (
    userId: string
  ): Promise<
    Partial<Subscription["user"]> & {
      companyInfo?: Subscription["companyInfo"];
      subscription?: {
        id: string;
        startDate: string;
      };
    }
  > => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user ${userId}: ${response.statusText}`
        );
      }
      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        cellPhone: data.cellPhone,
        officePhone: data.officePhone,
        role: data.role,
        status: data.status,
        companyInfo: data.companyInfo
          ? {
              businessName: data.companyInfo.businessName,
              agentName: data.companyInfo.agentName,
              phone: data.companyInfo.phoneNumber,
              email: data.companyInfo.email,
            }
          : undefined,
        subscription: data.subscription
          ? {
              id: data.subscription.id,
              startDate: data.subscription.startDate,
            }
          : undefined,
      };
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      return {
        id: userId,
        email: "",
        role: "unknown",
        status: "unknown",
      };
    }
  };

  const refreshAll = useCallback(async () => {
    await fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const trimmedQuery = query.trim().toLowerCase();
    const filtered = subscriptions.filter(
      (sub) =>
        (sub.user.firstName?.toLowerCase().includes(trimmedQuery) ?? false) ||
        (sub.user.lastName?.toLowerCase().includes(trimmedQuery) ?? false) ||
        sub.user.email.toLowerCase().includes(trimmedQuery) ||
        (sub.companyInfo?.businessName?.toLowerCase().includes(trimmedQuery) ??
          false)
    );
    setFilteredSubscriptions(filtered);
  };

  const downloadCSV = () => {
    const headers = [
      "Subscription ID",
      "User ID",
      "First Name",
      "Last Name",
      "Email",
      "Cell Phone",
      "Office Phone",
      "Role",
      "User Status",
      "Business Name",
      "Agent Name",
      "Company Phone",
      "Company Email",
      "Plan Type",
      "Subscription Status",
      "Start Date",
      "Renewal Date",
    ];
    const csvRows = [
      headers.join(","),
      ...sortedSubscriptions.map((sub) =>
        [
          sub.id,
          sub.userId,
          `"${sub.user.firstName?.replace(/"/g, '""') ?? "N/A"}"`,
          `"${sub.user.lastName?.replace(/"/g, '""') ?? "N/A"}"`,
          sub.user.email,
          sub.user.cellPhone ?? "N/A",
          sub.user.officePhone ?? "N/A",
          sub.user.role,
          sub.user.status,
          `"${sub.companyInfo?.businessName?.replace(/"/g, '""') ?? "N/A"}"`,
          `"${sub.companyInfo?.agentName?.replace(/"/g, '""') ?? "N/A"}"`,
          sub.companyInfo?.phone ?? "N/A",
          sub.companyInfo?.email ?? "N/A",
          sub.planType,
          sub.status,
          new Date(sub.startDate).toLocaleDateString(),
          sub.renewalDate
            ? new Date(sub.renewalDate).toLocaleDateString()
            : "N/A",
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `subscriptions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (!sortOrder) return 0;
    const aName = a.user.firstName ?? "";
    const bName = b.user.firstName ?? "";
    return sortOrder === "asc"
      ? aName.localeCompare(bName)
      : bName.localeCompare(aName);
  });

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, or business..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSort}
              className="hover:bg-blue-50"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort{" "}
              {sortOrder === "asc"
                ? "A-Z"
                : sortOrder === "desc"
                ? "Z-A"
                : "First Name"}
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              disabled={loading || subscriptions.length === 0}
              className="hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
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
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center">
              <DollarSign className="mr-2 text-blue-500" />
              <CardTitle className="text-xl">
                All Subscriptions ({filteredSubscriptions.length} total)
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm high-contrast:text-black">
                      First Name
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Last Name
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      User Email
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Cell Phone
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Office Phone
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      User Role
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      User Status
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Business Name
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Agent Name
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Company Phone
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Company Email
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Plan Type
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Subscription Status
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Start Date
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Renewal Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-sm text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : sortedSubscriptions.length > 0 ? (
                    sortedSubscriptions.map((sub) => (
                      <TableRow
                        key={sub.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm">
                          <Link
                            href={`/admin/dashboard/users/${sub.userId}`}
                            className="text-blue-500 hover:underline"
                          >
                            {sub.user.firstName ?? "N/A"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.user.lastName ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.user.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.user.cellPhone ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.user.officePhone ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.user.role}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.user.status}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.companyInfo?.businessName ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.companyInfo?.agentName ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.companyInfo?.phone ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.companyInfo?.email ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.planType}
                        </TableCell>
                        <TableCell className="text-sm">{sub.status}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.renewalDate
                            ? new Date(sub.renewalDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={15} className="text-sm text-center">
                        No subscriptions available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
