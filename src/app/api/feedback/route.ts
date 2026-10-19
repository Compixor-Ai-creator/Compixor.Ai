import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const KNOWN_TOOLS: Record<string, string> = {
  'pdf-compressor': 'Smart PDF Compressor',
  'pdf-organizer': 'Smart PDF Merge & Split',
  'add-watermark': 'Add Watermark to PDF',
  'remove-watermark': 'Remove Watermark from PDF',
  'protect-pdf': 'Protect PDF',
  'unlock-pdf': 'Unlock PDF',
  'word-compressor': 'Smart Word Compressor',
  'passport-photo': 'Biometric Passport Photo Maker',
  'full-dp-maker': 'No-Crop Full DP Resizer',
  'qr-generator': 'High-Res QR Code Generator',
  'pdf-to-word': 'PDF to Word Converter',
  'img-to-word': 'Image to Word Converter',
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

function hashIp(ip: string): string {
  const salt = process.env.FEEDBACK_SALT || process.env.IP_HASH_SALT || 'compixor-client-side-privacy-salt';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * GET /api/feedback
 * Returns only approved feedback records for public display on the homepage.
 */
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ items: [] });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('id, tool_name, rating, first_name, message, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[API Feedback GET Error]', error);
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err) {
    console.error('[API Feedback GET Exception]', err);
    return NextResponse.json({ items: [] });
  }
}

/**
 * POST /api/feedback
 * Validates submission, executes honeypot & IP rate limit checks, and saves with 'pending' status.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  // STEP 3: Honeypot Protection
  // If the hidden 'website' field has any value, silently return success without saving
  if (body.website && typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json(
      { success: true, message: 'Thanks! Your feedback will appear after review.' },
      { status: 200 }
    );
  }

  // STEP 2: Input Validation
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Rating must be an integer between 1 and 5 stars.' },
      { status: 400 }
    );
  }

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json(
      { error: 'Feedback message is required.' },
      { status: 400 }
    );
  }

  const cleanedMessage = stripHtml(body.message);
  if (cleanedMessage.length < 10 || cleanedMessage.length > 500) {
    return NextResponse.json(
      { error: 'Feedback message must be between 10 and 500 characters.' },
      { status: 400 }
    );
  }

  if (!body.tool_name || typeof body.tool_name !== 'string') {
    return NextResponse.json(
      { error: 'A valid tool name is required.' },
      { status: 400 }
    );
  }

  const rawTool = body.tool_name.trim();
  const matchedToolName = KNOWN_TOOLS[rawTool] || Object.values(KNOWN_TOOLS).find((name) => name === rawTool);
  if (!matchedToolName) {
    return NextResponse.json(
      { error: 'Invalid tool specified. Feedback must be for one of the recognized tools.' },
      { status: 400 }
    );
  }

  let firstName: string | null = null;
  if (body.first_name && typeof body.first_name === 'string') {
    const cleanedName = stripHtml(body.first_name);
    if (cleanedName.length > 40) {
      return NextResponse.json(
        { error: 'First name must not exceed 40 characters.' },
        { status: 400 }
      );
    }
    if (cleanedName.length > 0) {
      firstName = cleanedName;
    }
  }

  // STEP 3: IP Rate Limiting & Abuse Prevention
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. IP rate limit: max 3 submissions per IP per day
    const { count: ipDailyCount, error: ipCountError } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneDayAgo);

    if (ipCountError) {
      console.error('[API Rate Limit Check Error]', ipCountError);
    } else if (typeof ipDailyCount === 'number' && ipDailyCount >= 3) {
      return NextResponse.json(
        { error: 'Daily feedback limit reached for your connection (maximum 3 per day).' },
        { status: 429 }
      );
    }

    // 2. Max 1 submission per IP hash per tool per day
    const { count: toolDailyCount, error: toolCountError } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('tool_name', matchedToolName)
      .gte('created_at', oneDayAgo);

    if (toolCountError) {
      console.error('[API Tool Limit Check Error]', toolCountError);
    } else if (typeof toolDailyCount === 'number' && toolDailyCount >= 1) {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this tool today. Thank you!' },
        { status: 429 }
      );
    }

    // 3. Reject duplicate messages
    const { data: duplicateItem, error: dupError } = await supabase
      .from('feedback')
      .select('id')
      .eq('message', cleanedMessage)
      .limit(1);

    if (dupError) {
      console.error('[API Duplicate Check Error]', dupError);
    } else if (duplicateItem && duplicateItem.length > 0) {
      return NextResponse.json(
        { error: 'This exact feedback message has already been received.' },
        { status: 400 }
      );
    }

    // Insert feedback with status 'pending'
    const { error: insertError } = await supabase.from('feedback').insert({
      tool_name: matchedToolName,
      rating,
      first_name: firstName,
      message: cleanedMessage,
      status: 'pending',
      ip_hash: ipHash,
    });

    if (insertError) {
      console.error('[API Feedback Insert Error]', insertError);
      return NextResponse.json(
        { error: 'Failed to record feedback. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks! Your feedback will appear after review.',
    });
  } catch (err) {
    console.error('[API Feedback Exception]', err);
    return NextResponse.json(
      { error: 'Internal server error while processing feedback.' },
      { status: 500 }
    );
  }
}
