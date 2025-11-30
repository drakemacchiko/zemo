import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ArticleEditorClient from './ArticleEditorClient';

export const metadata: Metadata = {
  title: 'Edit Article - CMS - ZEMO Admin',
};

async function getArticle(id: string) {
  if (id === 'new') {
    return null;
  }

  const article = await prisma.helpArticle.findUnique({
    where: { id },
  });

  if (!article) {
    notFound();
  }

  return article;
}

async function getCategories() {
  return prisma.helpCategory.findMany({
    orderBy: { order: 'asc' },
  });
}

export default async function ArticleEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const [article, categories] = await Promise.all([
    getArticle(params.id),
    getCategories(),
  ]);

  const isNew = params.id === 'new';

  return (
    <ArticleEditorClient
      {...(isNew ? {} : { articleId: params.id })}
      {...(article ? { initialArticle: article as any } : {})}
      categories={categories}
    />
  );
}
