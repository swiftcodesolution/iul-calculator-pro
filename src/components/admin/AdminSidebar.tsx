import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  LogOut,
  Video,
  File,
  SquareMousePointer,
  Handshake,
  DollarSign,
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
      await signOut({ redirect: true });

      document.cookie =
        "user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;"; // Clear cookie

      toast.success("Signed out successfully");

      router.push("/admin");
    } catch (error) {
      console.error("Signout error:", error);
      toast.error("Failed to sign out");
    }
  };

  const hiddenSidebar =
    pathname.includes("/files/calculator") ||
    pathname.includes("/files/import") ||
    pathname.includes("/files/data");

  if (hiddenSidebar) return null;

  return (
    <aside className="w-64 h-screen p-4">
      <div className="text-2xl font-bold mb-6">Admin Panel</div>
      <nav className="space-y-2">
        <Link
          href="/admin/dashboard"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard" ? "bg-gray-600 text-white" : ""
          }`}
        >
          <LayoutDashboard className="mr-2 high-contrast:!text-white" />{" "}
          Dashboard
        </Link>
        <Link
          href="/admin/dashboard/files"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/files"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <FileText className="mr-2 high-contrast:!text-white" /> Pro Sample
          Files
        </Link>
        <Link
          href="/admin/dashboard/users"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/users"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <Users className="mr-2 high-contrast:!text-white" /> Users
        </Link>
        <Link
          href="/admin/dashboard/download-resources"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/download-resources"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <FileText className="mr-2 high-contrast:!text-white" /> Download
          Resources
        </Link>
        <Link
          href="/admin/dashboard/training-videos"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/training-videos"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <Video className="mr-2 high-contrast:!text-white" /> Training Videos
        </Link>
        <Link
          href="/admin/dashboard/training-documents"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/training-documents"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <File className="mr-2 high-contrast:!text-white" /> Training Documents
        </Link>
        <Link
          href="/admin/dashboard/tab-content"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/tab-content"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <SquareMousePointer className="mr-2 high-contrast:!text-white" /> Tab
          Content
        </Link>
        <Link
          href="/admin/dashboard/insurance-companies"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/insurance-companies"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <Handshake className="mr-2 high-contrast:!text-white" /> Insurance
          Companies
        </Link>
        <Link
          href="/admin/dashboard/subscriptions"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/subscriptions"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <DollarSign className="mr-2 high-contrast:!text-white" />{" "}
          Subscriptions
        </Link>
        <Link
          href="/admin/dashboard/stats"
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300 ${
            pathname === "/admin/dashboard/stats"
              ? "bg-gray-600 text-white"
              : ""
          }`}
        >
          <BarChart className="mr-2 high-contrast:!text-white" /> Stats
        </Link>
        <Link
          href="#"
          onClick={handleSignOut}
          className={`flex items-center p-2 rounded hover:bg-gray-600 hover:text-white transition-all duration-300`}
        >
          <LogOut className="mr-2 high-contrast:!text-white" /> Log Out
        </Link>
      </nav>
    </aside>
  );
}
