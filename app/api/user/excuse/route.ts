import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const body = await req.json();
  const {
    type,
    userID,
    date,
    reason,
    notes,
    eta,
    etd
  } = body;

  if (!type || !date || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // For late excuse
  if (type === 'late' && !eta) {
    return NextResponse.json({ error: 'Missing estimated time of arrival for late excuse' }, { status: 400 });
  }

  // For stepping out excuse
  if (type === 'stepping_out' && !eta && !etd) {
    return NextResponse.json({ error: 'Missing out/return time for stepping out excuse' }, { status: 400 });
  }

  // Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Insert user info
  const { error: insertError } = await supabase.from('excuses').insert([
    {
      type,
      user_id: user.id,
      date,
      reason,
      notes: notes || '',
      eta: type === 'late' || 'stepping out' ? eta : null,
      etd: type === 'stepping_out' ? etd : null
    },
  ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Excuse submitted successfully' }, { status: 200 });
}