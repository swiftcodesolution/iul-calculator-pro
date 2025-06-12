import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      await signOut({ redirect: false });
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error signing out");
      console.error(error);
    }
  };

  const hiddenSidebar =
    pathname.includes("/files/calculator") ||
    pathname.includes("/files/import") ||
    pathname.includes("/files/data");

  if (hiddenSidebar) return null;

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
          href="#"
          onClick={handleSignOut}
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <LogOut className="mr-2" /> Log Out
        </Link>
      </nav>
    </aside>
  );
}
