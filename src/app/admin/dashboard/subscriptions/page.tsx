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
import { DollarSign, RefreshCw, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Subscription {
  userId: string;
  status: string;
  planType: string;
  endDate?: string;
  userEmail: string;
  userName: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError("Error loading subscriptions");
      console.error(err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    await fetchSubscriptions();
    setLoading(false);
  };

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    if (!sortOrder) return 0;
    return sortOrder === "asc"
      ? a.userName.localeCompare(b.userName)
      : b.userName.localeCompare(b.userName);
  });

  useEffect(() => {
    refreshAll();
  }, []);

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
          <div className="flex gap-2">
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
                : "Name"}
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
                All Subscriptions ({subscriptions.length} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm high-contrast:text-black">
                      User
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Email
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Plan Type
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      Status
                    </TableHead>
                    <TableHead className="text-sm high-contrast:text-black">
                      End Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSubscriptions.length > 0 ? (
                    sortedSubscriptions.map((sub) => (
                      <TableRow
                        key={sub.userId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm">
                          <Link
                            href={`/admin/dashboard/users/${sub.userId}`}
                            className="text-blue-500 hover:underline"
                          >
                            {sub.userName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.userEmail}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.planType}
                        </TableCell>
                        <TableCell className="text-sm">{sub.status}</TableCell>
                        <TableCell className="text-sm">
                          {sub.endDate
                            ? new Date(sub.endDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-center">
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
