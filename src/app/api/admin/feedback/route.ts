import { NextResponse } from 'next/server';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/adminAuth';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function checkAuth(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  return verifyAdminToken(token);
}

/**
 * GET /api/admin/feedback
 * Returns pending and approved feedback items for admin review.
 */
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { data: pending, error: pendingErr } = await supabase
      .from('feedback')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const { data: approved, error: approvedErr } = await supabase
      .from('feedback')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (pendingErr || approvedErr) {
      console.error('[Admin Feedback Fetch Error]', pendingErr || approvedErr);
      return NextResponse.json({ error: 'Failed to fetch feedback records.' }, { status: 500 });
    }

    return NextResponse.json({
      pending: pending || [],
      approved: approved || [],
    });
  } catch (err) {
    console.error('[Admin Feedback Exception]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/feedback
 * Approves a feedback item: updates status to 'approved'.
 */
export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'Feedback ID is required.' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('[Admin Feedback Approve Error]', error);
      return NextResponse.json({ error: 'Failed to approve item.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Feedback approved.' });
  } catch (err) {
    console.error('[Admin Feedback Approve Exception]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/feedback
 * Permanently deletes a feedback item.
 */
export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'Feedback ID is required.' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin Feedback Delete Error]', error);
      return NextResponse.json({ error: 'Failed to delete item.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Feedback deleted.' });
  } catch (err) {
    console.error('[Admin Feedback Delete Exception]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
