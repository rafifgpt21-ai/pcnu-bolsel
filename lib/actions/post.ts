"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Helper: generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export type PostFormData = {
  id?: string;
  title: string;
  category: string;
  thumbnail?: string;
  status: "Published" | "Draft";
  blocks: {
    id: string;
    type: string;
    content: string;
    isLocked?: boolean;
  }[];
};

// CREATE or UPDATE a post
export async function savePost(data: PostFormData) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const slug = generateSlug(data.title);

    if (data.id) {
      // UPDATE existing post
      const post = await prisma.post.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          category: data.category,
          thumbnail: data.thumbnail || null,
          status: data.status,
          blocks: data.blocks.map((b) => ({
            id: b.id,
            type: b.type,
            content: b.content,
            isLocked: b.isLocked ?? false,
          })),
        },
      });
      revalidatePath("/admin");
      revalidatePath(`/post/${post.slug}`);
      revalidatePath("/");
      return { success: true, post };
    } else {
      // CREATE new post
      // Ensure slug uniqueness
      let uniqueSlug = slug;
      let counter = 1;
      while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const post = await prisma.post.create({
        data: {
          title: data.title,
          slug: uniqueSlug,
          category: data.category,
          thumbnail: data.thumbnail || null,
          status: data.status,
          blocks: data.blocks.map((b) => ({
            id: b.id,
            type: b.type,
            content: b.content,
            isLocked: b.isLocked ?? false,
          })),
        },
      });
      revalidatePath("/admin");
      revalidatePath("/");
      return { success: true, post };
    }
  } catch (error: unknown) {
    console.error("Error saving post:", error);
    return { success: false, error: "Gagal menyimpan postingan" };
  }
}

// DELETE a post
export async function deletePost(id: string) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Gagal menghapus postingan" };
  }
}

// GET posts with optional search & filter
export async function getPosts(options?: {
  search?: string;
  status?: string;
  category?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (options?.search) {
      where.title = { contains: options.search, mode: "insensitive" };
    }
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.category) {
      where.category = options.category;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return posts;
  } catch (error: unknown) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// GET single post by id
export async function getPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    return post;
  } catch {
    return null;
  }
}

// GET single post by slug (for public view)
export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.post.findUnique({ where: { slug } });
    return post;
  } catch {
    return null;
  }
}
