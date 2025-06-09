import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <div className="text-2xl font-bold mb-6">Admin Panel</div>
      <nav className="space-y-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <LayoutDashboard className="mr-2" /> Dashboard
        </Link>
        <Link
          href="/admin/dashboard/files"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <FileText className="mr-2" /> Pro Sample Files
        </Link>
        <Link
          href="/admin/dashboard/users"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <Users className="mr-2" /> Users
        </Link>
        <Link
          href="/admin/dashboard/download-resources"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <FileText className="mr-2" /> Download Resources
        </Link>
        <Link
          href="/admin/dashboard/stats"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <BarChart className="mr-2" /> Stats
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <LogOut className="mr-2" /> Log Out
        </Link>
      </nav>
    </aside>
  );
}
