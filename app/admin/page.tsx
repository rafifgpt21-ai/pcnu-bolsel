import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPosts } from "@/lib/actions/post";
import { AdminPostList } from "@/components/admin/AdminPostList";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/admin/login");
  }

  if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const posts = await getPosts();

  // Serialize dates for the client component
  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return <AdminPostList initialPosts={serializedPosts} />;
}
