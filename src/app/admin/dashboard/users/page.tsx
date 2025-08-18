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
  role: string;
  _count: {
    files: number;
    sessionHistory: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<
    "most" | "least" | "asc" | "desc" | "none"
  >("none");
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
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOrder === "most") {
      return b._count.sessionHistory - a._count.sessionHistory;
    } else if (sortOrder === "least") {
      return a._count.sessionHistory - b._count.sessionHistory;
    } else if (sortOrder === "asc") {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim() || "N/A";
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim() || "N/A";
      return nameA.localeCompare(nameB);
    } else if (sortOrder === "desc") {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim() || "N/A";
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim() || "N/A";
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

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
                  placeholder="Search by name, email, or role"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
                <Select
                  onValueChange={(
                    value: "most" | "least" | "asc" | "desc" | "none"
                  ) => setSortOrder(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sorting</SelectItem>
                    <SelectItem value="most">Most Active</SelectItem>
                    <SelectItem value="least">Least Active</SelectItem>
                    <SelectItem value="asc">Name (A-Z)</SelectItem>
                    <SelectItem value="desc">Name (Z-A)</SelectItem>
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
                      Role
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
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.cellPhone || "N/A"}</TableCell>
                      <TableCell>{user.officePhone || "N/A"}</TableCell>
                      <TableCell>{user._count.files || 0}</TableCell>
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
