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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: string;
  startDate: string;
  renewalDate?: string;
  remainingDays?: number;
  iulSalesCount: number;
  user: {
    id: string;
    name: string;
    email: string;
    foreverFree: boolean;
  };
}

interface SubscriptionApiResponse {
  userId: string;
  status: string;
  planType: string;
  startDate: string;
  endDate?: string;
  remainingDays?: number;
  userEmail: string;
  userName: string;
  foreverFree: boolean;
  iulSalesCount: number;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    Subscription[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<
    "name" | "startDate" | "renewalDate" | "remainingDays"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  // const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingForeverFree, setUpdatingForeverFree] = useState<string | null>(
    null
  );

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscriptions: ${response.statusText}`
        );
      }
      const data: SubscriptionApiResponse[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: Expected an array");
      }

      const enrichedSubscriptions: Subscription[] = data.map((sub) => ({
        id: sub.userId, // Use userId as id for simplicity
        userId: sub.userId,
        planType: sub.planType,
        status: sub.status,
        startDate: sub.startDate,
        renewalDate: sub.endDate,
        remainingDays: sub.remainingDays,
        iulSalesCount: sub.iulSalesCount,
        user: {
          id: sub.userId,
          name: sub.userName,
          email: sub.userEmail,
          foreverFree: sub.foreverFree,
        },
      }));

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

  /*
  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    setUpdatingStatus(userId);
    try {
      const newStatus = currentStatus === "active" ? "expired" : "active";
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update subscription status");
      }

      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.userId === userId ? { ...sub, status: newStatus } : sub
        )
      );
      setFilteredSubscriptions((prev) =>
        prev.map((sub) =>
          sub.userId === userId ? { ...sub, status: newStatus } : sub
        )
      );
      toast.success(
        `Subscription ${
          newStatus === "active" ? "activated" : "expired"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to update subscription status");
      console.error("Update status error:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };
  */

  const handleUpdateForeverFree = async (userId: string, checked: boolean) => {
    setUpdatingForeverFree(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: subscriptions.find((sub) => sub.userId === userId)?.status,
          foreverFree: checked,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update forever free status");
      }

      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.userId === userId
            ? { ...sub, user: { ...sub.user, foreverFree: checked } }
            : sub
        )
      );
      setFilteredSubscriptions((prev) =>
        prev.map((sub) =>
          sub.userId === userId
            ? { ...sub, user: { ...sub.user, foreverFree: checked } }
            : sub
        )
      );
      toast.success(
        `User ${checked ? "marked" : "unmarked"} as forever free successfully`
      );
    } catch (err) {
      toast.error("Failed to update forever free status");
      console.error("Update forever free error:", err);
    } finally {
      setUpdatingForeverFree(null);
    }
  };

  const handleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const refreshAll = useCallback(async () => {
    await fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const trimmedQuery = query.trim().toLowerCase();
    const filtered = subscriptions.filter(
      (sub) =>
        sub.user.name.toLowerCase().includes(trimmedQuery) ||
        sub.user.email.toLowerCase().includes(trimmedQuery)
    );
    setFilteredSubscriptions(filtered);
  };

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Forever Free",
      "Plan Type",
      "Subscription Status",
      "Start Date",
      "Renewal Date",
      "Remaining Days",
      "IUL Sales",
    ];
    const csvRows = [
      headers.join(","),
      ...sortedSubscriptions.map((sub) =>
        [
          `"${sub.user.name.replace(/"/g, '""')}"`,
          sub.user.email,
          sub.user.foreverFree ? "Yes" : "No",
          sub.planType,
          sub.status,
          new Date(sub.startDate).toLocaleDateString(),
          sub.renewalDate
            ? new Date(sub.renewalDate).toLocaleDateString()
            : "N/A",
          sub.remainingDays !== undefined ? sub.remainingDays : "N/A",
          sub.iulSalesCount,
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
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.user.name.localeCompare(b.user.name)
        : b.user.name.localeCompare(a.user.name);
    } else if (sortField === "startDate") {
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    } else if (sortField === "renewalDate") {
      const aDate = a.renewalDate ? new Date(a.renewalDate).getTime() : 0;
      const bDate = b.renewalDate ? new Date(b.renewalDate).getTime() : 0;
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    } else if (sortField === "remainingDays") {
      const aDays = a.remainingDays ?? Infinity;
      const bDays = b.remainingDays ?? Infinity;
      return sortOrder === "asc" ? aDays - bDays : bDays - aDays;
    }
    return 0;
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
          <h1 className="text-3xl font-bold flex items-center">
            <DollarSign className="mr-2 text-blue-500" /> Subscriptions
          </h1>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select
              value={sortField}
              onValueChange={(
                value: "name" | "startDate" | "renewalDate" | "remainingDays"
              ) => setSortField(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="startDate">Start Date</SelectItem>
                <SelectItem value="renewalDate">Renewal Date</SelectItem>
                <SelectItem value="remainingDays">Remaining Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortOrder}
              className="hover:bg-blue-50"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
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
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">
              All Subscriptions ({filteredSubscriptions.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm high-contrast:text-black">
                    Name
                  </TableHead>
                  <TableHead className="text-sm high-contrast:text-black">
                    Email
                  </TableHead>
                  <TableHead className="text-sm high-contrast:text-black">
                    Forever Free
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
                  <TableHead className="text-sm high-contrast:text-black">
                    Remaining Days
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-center">
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
                          {sub.user.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.user.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Checkbox
                          checked={sub.user.foreverFree}
                          onCheckedChange={(checked) =>
                            handleUpdateForeverFree(sub.userId, !!checked)
                          }
                          disabled={updatingForeverFree === sub.userId}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{sub.planType}</TableCell>
                      <TableCell className="text-sm">{sub.status}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.renewalDate
                          ? new Date(sub.renewalDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.remainingDays !== undefined
                          ? sub.remainingDays
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-center">
                      No subscriptions available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
