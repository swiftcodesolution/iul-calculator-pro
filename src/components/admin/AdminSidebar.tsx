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
        <Link href="/admin/dashboard" className="flex items-center p-2 rounded">
          <LayoutDashboard className="mr-2" /> Dashboard
        </Link>
        <Link
          href="/admin/dashboard/files"
          className="flex items-center p-2 rounded"
        >
          <FileText className="mr-2" /> Pro Sample Files
        </Link>
        <Link
          href="/admin/dashboard/users"
          className="flex items-center p-2 rounded"
        >
          <Users className="mr-2" /> Users
        </Link>
        <Link
          href="/admin/dashboard/download-resources"
          className="flex items-center p-2 rounded"
        >
          <FileText className="mr-2" /> Download Resources
        </Link>
        <Link
          href="/admin/dashboard/training-videos"
          className="flex items-center p-2 rounded"
        >
          <Video className="mr-2" /> Training Videos
        </Link>
        <Link
          href="/admin/dashboard/training-documents"
          className="flex items-center p-2 rounded"
        >
          <File className="mr-2" /> Training Documents
        </Link>
        <Link
          href="/admin/dashboard/tab-content"
          className="flex items-center p-2 rounded"
        >
          <SquareMousePointer className="mr-2" /> Tab Content
        </Link>
        <Link
          href="/admin/dashboard/insurance-companies"
          className="flex items-center p-2 rounded"
        >
          <Handshake className="mr-2" /> Insurance Companies
        </Link>
        <Link
          href="/admin/dashboard/stats"
          className="flex items-center p-2 rounded"
        >
          <BarChart className="mr-2" /> Stats
        </Link>
        <Link
          href="#"
          onClick={handleSignOut}
          className="flex items-center p-2 rounded"
        >
          <LogOut className="mr-2" /> Log Out
        </Link>
      </nav>
    </aside>
  );
}
