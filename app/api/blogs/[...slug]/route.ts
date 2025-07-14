import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  originalUrl: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string | string[] } }
) {
  try {
    const { slug } = params;
    const fullSlug = Array.isArray(slug) ? slug.join('/') : slug;

    const response = await fetch(`https://heartitout.in/blogs/${fullSlug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Clean up junk
    $('script, style, noscript').remove();

    // ✅ Select correct values from uploaded DOM
    const title = $('h1.blog-title').first().text().trim();
    const content = $('.blog-text-sec').html() || '';
    const author = $('.blog-author').first().text().trim() || 'Heart It Out Team';
    const publishedAt = $('.blog-date').first().text().trim() || new Date().toISOString();
    const category = $('.card-category p').first().text().trim() || 'Mental Health';

    const imageUrl = $('img.blog-hero-img').attr('src');
    console.log('Final image URL:', imageUrl);
 
    const tags: string[] = []; // Not visible in your uploaded HTML; leave as empty or parse from body if needed

    const wordCount = $(content).text().split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} min read`;

    const article: BlogArticle = {
      id: fullSlug,
      title,
      content,
      author,
      publishedAt,
      readTime,
      category,
      tags,
      imageUrl,
      originalUrl: `https://heartitout.in/blogs/${fullSlug}`,
    };

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
