import { PostEditor } from "@/components/admin/PostEditor";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPostById } from "@/lib/actions/post";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    redirect("/admin");
  }

  return (
    <PostEditor
      initialData={post}
      currentUser={{ name: session.user.name || "Redaksi PCNU", role: session.user.role }}
    />
  );
}
