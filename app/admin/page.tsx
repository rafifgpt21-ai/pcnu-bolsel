import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminPosts } from "@/lib/actions/post";
import { AdminPostList } from "@/components/admin/AdminPostList";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/admin/login");
  }

  if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const posts = await getAdminPosts();
  return <AdminPostList initialPosts={posts} currentRole={session.user.role} />;
}
