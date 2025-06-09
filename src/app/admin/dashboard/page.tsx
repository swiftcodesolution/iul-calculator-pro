import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, BarChart, Download } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const mockFiles = [
    { id: 1, name: "Sample Plan A", type: "PDF", size: "2.5MB" },
    { id: 2, name: "Sample Plan B", type: "CSV", size: "1.8MB" },
    { id: 3, name: "Sample Plan C", type: "XLSX", size: "3.2MB" },
  ];

  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "User" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ];

  const mockResources = [
    { id: 1, name: "Guide.pdf", type: "PDF", downloads: 120 },
    { id: 2, name: "Tutorial.mp4", type: "Video", downloads: 85 },
    { id: 3, name: "Template.docx", type: "Document", downloads: 45 },
  ];

  const mockStats = [
    { id: 1, metric: "Active Users", value: 150 },
    { id: 2, metric: "File Uploads", value: 320 },
    { id: 3, metric: "Downloads", value: 200 },
  ];

  return (
    <div className="flex-1">
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Pro Sample Files Card */}
          <Card>
            <CardHeader className="flex items-center">
              <FileText className="mr-2" />
              <CardTitle>Pro Sample Files</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockFiles.map((file) => (
                  <li key={file.id} className="text-sm">
                    {file.name} ({file.type}, {file.size})
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/dashboard/files"
                className="text-blue-500 hover:underline mt-4 block"
              >
                Manage Files
              </Link>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card>
            <CardHeader className="flex items-center">
              <Users className="mr-2" />
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockUsers.map((user) => (
                  <li key={user.id} className="text-sm">
                    {user.name} ({user.email}, {user.role})
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/dashboard/users"
                className="text-blue-500 hover:underline mt-4 block"
              >
                Manage Users
              </Link>
            </CardContent>
          </Card>

          {/* Download Resources Card */}
          <Card>
            <CardHeader className="flex items-center">
              <Download className="mr-2" />
              <CardTitle>Download Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockResources.map((resource) => (
                  <li key={resource.id} className="text-sm">
                    {resource.name} ({resource.type}, {resource.downloads}{" "}
                    downloads)
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/dashboard/downloads-content"
                className="text-blue-500 hover:underline mt-4 block"
              >
                Manage Resources
              </Link>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader className="flex items-center">
              <BarChart className="mr-2" />
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockStats.map((stat) => (
                  <li key={stat.id} className="text-sm">
                    {stat.metric}: {stat.value}
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/dashboard/stats"
                className="text-blue-500 hover:underline mt-4 block"
              >
                View Stats
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
