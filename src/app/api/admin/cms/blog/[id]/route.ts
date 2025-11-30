import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

// GET /api/admin/cms/blog/[id] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload || !['ADMIN', 'SUPER_ADMIN'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cms/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload || !['ADMIN', 'SUPER_ADMIN'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      featuredImage,
      tags,
      metaTitle,
      metaDescription,
      status,
      publishedAt,
    } = body;

    // Validation
    if (!title || !slug || !excerpt || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if slug is taken by another post
    if (slug !== existingPost.slug) {
      const slugTaken = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update post
    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        featuredImage: featuredImage || null,
        tags: tags || [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        status: status || 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cms/blog/[id] - Delete blog post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = _request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload || !['ADMIN', 'SUPER_ADMIN'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete post
    await prisma.blogPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
