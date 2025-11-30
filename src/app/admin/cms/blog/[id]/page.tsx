import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import BlogEditorClient from './BlogEditorClient';

async function getPost(id: string) {
  if (id === 'new') return null;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!post) {
    notFound();
  }

  return post;
}

async function getCategories() {
  return await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function BlogEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const [post, categories] = await Promise.all([
    getPost(params.id),
    getCategories(),
  ]);

  const isNew = params.id === 'new';

  return (
    <BlogEditorClient
      {...(isNew ? {} : { postId: params.id })}
      {...(post ? { initialPost: post as any } : {})}
      categories={categories}
    />
  );
}
