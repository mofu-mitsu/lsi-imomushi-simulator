import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/src/db/index';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const body = await req.json();
    const { selfType, ownerName } = body;

    await db.update(users)
      .set({ 
        ...(selfType !== undefined ? { selfType } : {}),
        ...(ownerName !== undefined ? { ownerName } : {})
      })
      .where(eq(users.uid, decodedToken.uid));

    const [updatedUser] = await db.select().from(users).where(eq(users.uid, decodedToken.uid)).limit(1);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
