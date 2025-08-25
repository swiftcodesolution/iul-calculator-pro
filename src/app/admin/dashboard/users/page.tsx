"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  cellPhone: string | null;
  officePhone: string | null;
  trialEndDate?: string | null;
  _count: {
    files: number;
    sessionHistory: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<
    "name" | "email" | "files" | "sessions" | "trialEndDate"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError("Error loading users");
        console.error(err);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`
      .trim()
      .toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === "name") {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim() || "N/A";
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim() || "N/A";
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortField === "email") {
      return sortOrder === "asc"
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    } else if (sortField === "files") {
      return sortOrder === "asc"
        ? a._count.files - b._count.files
        : b._count.files - a._count.files;
    } else if (sortField === "sessions") {
      return sortOrder === "asc"
        ? a._count.sessionHistory - b._count.sessionHistory
        : b._count.sessionHistory - a._count.sessionHistory;
    } else if (sortField === "trialEndDate") {
      const aDate = a.trialEndDate ? new Date(a.trialEndDate).getTime() : 0;
      const bDate = b.trialEndDate ? new Date(b.trialEndDate).getTime() : 0;
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    }
    return 0;
  });

  const formatTrialTimeRemaining = (trialEndDate?: string | null) => {
    if (!trialEndDate) return "N/A";
    const endDate = new Date(trialEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${endDate.toLocaleDateString()} (+${diffDays} days)`;
  };

  return (
    <div className="min-h-screen overflow-y-scroll">
      <main className="p-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Users className="mr-2 text-blue-500" /> Manage Users
          </h1>
        </motion.div>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
                <Select
                  value={sortField}
                  onValueChange={(
                    value:
                      | "name"
                      | "email"
                      | "files"
                      | "sessions"
                      | "trialEndDate"
                  ) => setSortField(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="files">Total Files</SelectItem>
                    <SelectItem value="sessions">Session History</SelectItem>
                    <SelectItem value="trialEndDate">Trial End Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h2 className="font-bold text-2xl">
                  Total Users: {sortedUsers.length}
                </h2>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : sortedUsers.length === 0 ? (
              <p className="">No users found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="high-contrast:text-black">
                    <TableHead className="high-contrast:text-black">
                      Name
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Email
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Cell Phone
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Office Phone
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Total Files
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Trial Time Remaining
                    </TableHead>
                    <TableHead className="high-contrast:text-black">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        {`${user.firstName || ""} ${
                          user.lastName || ""
                        }`.trim() || "N/A"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.cellPhone || "N/A"}</TableCell>
                      <TableCell>{user.officePhone || "N/A"}</TableCell>
                      <TableCell>{user._count.files || 0}</TableCell>
                      <TableCell>
                        {formatTrialTimeRemaining(user.trialEndDate)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/dashboard/users/${user.id}`}
                          className="text-blue-500 hover:underline"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
