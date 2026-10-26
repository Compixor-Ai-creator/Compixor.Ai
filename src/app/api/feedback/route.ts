import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const KNOWN_TOOLS: Record<string, string> = {
  'general': 'Compixor Suite',
  'compixor-suite': 'Compixor Suite',
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

export interface FeedbackItem {
  id: string;
  tool_name: string;
  rating: number;
  first_name: string | null;
  message: string;
  status: 'pending' | 'approved';
  created_at: string;
}

// Global in-memory storage fallback when Supabase is unconfigured or unavailable
declare global {
  // eslint-disable-next-line no-var
  var __compixor_fallback_feedback__: FeedbackItem[] | undefined;
}

const fallbackStore: FeedbackItem[] = global.__compixor_fallback_feedback__ || [];
global.__compixor_fallback_feedback__ = fallbackStore;

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
 * Returns approved feedback records for public display on the homepage.
 */
export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('id, tool_name, rating, first_name, message, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge any recent in-memory fallback items that might not have synced yet
        const existingIds = new Set(data.map((d: any) => d.id));
        const extraFallback = fallbackStore.filter(f => f.status === 'approved' && !existingIds.has(f.id));
        return NextResponse.json({ items: [...extraFallback, ...data] });
      }
    } catch (err) {
      console.error('[API Feedback GET Exception]', err);
    }
  }

  // Return fallback in-memory store if Supabase is unconfigured or empty
  const approvedFallback = fallbackStore.filter(f => f.status === 'approved');
  return NextResponse.json({ items: approvedFallback });
}

/**
 * POST /api/feedback
 * Validates submission, executes honeypot & rate limit checks, and saves feedback.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  // 1. Honeypot Protection
  if (body.website && typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json(
      { success: true, message: 'Thanks! Your feedback has been shared.' },
      { status: 200 }
    );
  }

  // 2. Input Validation
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

  // Tool name is optional: defaults to 'Compixor Suite'
  let matchedToolName = 'Compixor Suite';
  if (body.tool_name && typeof body.tool_name === 'string' && body.tool_name.trim().length > 0) {
    const rawTool = body.tool_name.trim();
    matchedToolName =
      KNOWN_TOOLS[rawTool] ||
      Object.values(KNOWN_TOOLS).find((name) => name.toLowerCase() === rawTool.toLowerCase()) ||
      rawTool.slice(0, 50);
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

  // 3. Client IP & Rate Limiting
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  const newFeedbackItem: FeedbackItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tool_name: matchedToolName,
    rating,
    first_name: firstName,
    message: cleanedMessage,
    status: 'approved',
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();

  if (supabase) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      // IP rate limit: max 5 submissions per IP per day
      const { count: ipDailyCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', oneDayAgo);

      if (typeof ipDailyCount === 'number' && ipDailyCount >= 5) {
        return NextResponse.json(
          { error: 'Daily feedback limit reached for your connection (maximum 5 per day).' },
          { status: 429 }
        );
      }

      // Reject duplicate messages
      const { data: duplicateItem } = await supabase
        .from('feedback')
        .select('id')
        .eq('message', cleanedMessage)
        .limit(1);

      if (duplicateItem && duplicateItem.length > 0) {
        return NextResponse.json(
          { error: 'This exact feedback message has already been received.' },
          { status: 400 }
        );
      }

      // Insert feedback with status 'approved'
      const { error: insertError } = await supabase.from('feedback').insert({
        id: newFeedbackItem.id,
        tool_name: matchedToolName,
        rating,
        first_name: firstName,
        message: cleanedMessage,
        status: 'approved',
        ip_hash: ipHash,
      });

      if (!insertError) {
        fallbackStore.unshift(newFeedbackItem);
        return NextResponse.json({
          success: true,
          message: 'Thank you! Your feedback has been shared.',
          item: newFeedbackItem,
        });
      }
      console.warn('[API Feedback Supabase Insert fallback]', insertError);
    } catch (err) {
      console.error('[API Feedback Supabase Exception]', err);
    }
  }

  // Graceful fallback to persistent in-memory store
  fallbackStore.unshift(newFeedbackItem);

  return NextResponse.json({
    success: true,
    message: 'Thank you! Your feedback has been shared.',
    item: newFeedbackItem,
  });
}
