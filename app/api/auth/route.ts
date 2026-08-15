import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getOrCreateUser, getOrCreateCaterpillar } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const { selfType } = await req.json().catch(() => ({ selfType: undefined }));

    const user = await getOrCreateUser(decodedToken.uid, decodedToken.email || '', selfType);
    const caterpillar = await getOrCreateCaterpillar(user.id);

    return NextResponse.json({ user, caterpillar });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
