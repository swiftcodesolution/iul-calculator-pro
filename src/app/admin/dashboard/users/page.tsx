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
  const [sortOrder, setSortOrder] = useState<"most" | "least" | "none">("none");

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

  // Sort users based on session count
  const sortedUsers = [...users].sort((a, b) => {
    if (sortOrder === "most") {
      return b._count.sessionHistory - a._count.sessionHistory;
    } else if (sortOrder === "least") {
      return a._count.sessionHistory - b._count.sessionHistory;
    }
    return 0;
  });

  return (
    <div className="max-h-screen overflow-y-scroll">
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Users className="mr-2" /> Manage Users
        </h1>
        <div className="mb-4">
          <Select
            onValueChange={(value: "most" | "least" | "none") =>
              setSortOrder(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Sorting</SelectItem>
              <SelectItem value="most">Most Active</SelectItem>
              <SelectItem value="least">Least Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="p-4 rounded shadow">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cell Phone</TableHead>
                  <TableHead>Office Phone</TableHead>
                  <TableHead>Total Files</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
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
        </div>
      </main>
    </div>
  );
}
