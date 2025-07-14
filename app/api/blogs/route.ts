import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  readTime: string;
  category: string;
  imageUrl?: string;
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://heartitout.in/blogs/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko)             Version/17.0 Safari/605.1.15',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml'
      },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Failed to fetch blogs');

    const html = await response.text();
    // console.log(html);
    const $ = cheerio.load(html);
    const blogs: BlogPost[] = [];

    $('.card').each((index, element) => {
      const $el = $(element);
      const title = $el.find('.card-title').text().trim();
      const category = $el.find('.card-category p').text().trim();
      const readTime = $el.find('.card-text').text().trim();
      const imageUrlRaw = $el.find('.card-img img').attr('src');
      const imageUrl = imageUrlRaw
        ? imageUrlRaw.startsWith('http')
          ? imageUrlRaw
          : `https://heartitout.in${imageUrlRaw}`
        : undefined;
      const url = $el.find('a.btn').attr('href');
      const slug = url?.split('/blogs/')[1]?.replace(/\/$/, '') || `blog-${index}`;

      if (title && url) {
        blogs.push({
          id: slug, // now the actual blog slug,
          title,
          summary: '', // No summary text in homepage cards
          url: url.startsWith('http') ? url : `https://heartitout.in${url}`,
          publishedAt: new Date().toLocaleDateString(),
          readTime,
          category,
          imageUrl: imageUrl
        });
      }
    });

    // Fallback mock data if scraping fails
  if (blogs.length === 0) {
    console.warn('No blogs scraped. Returning empty array.');
    return NextResponse.json({ blogs: [] });
  }

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}