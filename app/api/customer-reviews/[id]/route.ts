import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const REVIEW_FILES: Record<string, string> = {
  'phone-mockup-jersey': 'public/images/reviews/phone-mockup-jersey.png',
  'phone-mockup-cards': 'public/images/reviews/phone-mockup-cards.png',
  'whatsapp-feedback': 'public/images/reviews/whatsapp-feedback.png',
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const relativePath = REVIEW_FILES[id];

  if (!relativePath) {
    return new NextResponse('Image not found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), relativePath);

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentTypeFor(filePath),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Image not available', { status: 404 });
  }
}
