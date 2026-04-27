import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const GALLERY_FILES: Record<string, string> = {
  'founder-team': 'public/images/gallery/founder-team.png',
  'sourcing-partners': 'public/images/gallery/sourcing-partners.png',
  'factory-meeting': 'public/images/gallery/factory-meeting.png',
  'team-partner-review': 'public/images/gallery/team-partner-review.png',
  'container-load': 'public/images/gallery/container-load.png',
  'rnh-team-hq': 'public/images/gallery/rnh-team-hq.png',
  'forklift-offload': 'public/images/gallery/forklift-offload.png',
  'delivery-unload': 'public/images/gallery/delivery-unload.png',
  'factory-inspection': 'public/images/gallery/factory-inspection.png',
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
  const relativePath = GALLERY_FILES[id];

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
