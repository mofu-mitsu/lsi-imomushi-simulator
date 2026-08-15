import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/src/db/index';
import { caterpillars, users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

const STAGE_THRESHOLDS = [0, 100, 300, 600, 1000]; // 0: 幼虫, 1: 課長, 2: 法務部長, 3: 監査主任, 4: 伝説の72,000匹

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const body = await req.json();
    const { expGain = 10 } = body;

    const [user] = await db.select().from(users).where(eq(users.uid, decodedToken.uid)).limit(1);

    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [caterpillar] = await db.select().from(caterpillars).where(eq(caterpillars.userId, user.id)).limit(1);

    if (!caterpillar) {
      return NextResponse.json({ error: 'Caterpillar not found' }, { status: 404 });
    }

    let actualExpGain = expGain;
    if (user.selfType && user.selfType.toUpperCase().includes('LSI')) {
      actualExpGain = Math.floor(expGain * 1.5); // LSI同族ボーナス
    }

    let newExp = caterpillar.exp + actualExpGain;
    let newStage = caterpillar.stage;

    // Check for evolution
    while (newStage < STAGE_THRESHOLDS.length - 1 && newExp >= STAGE_THRESHOLDS[newStage + 1]) {
      newStage++;
    }

    await db.update(caterpillars)
      .set({ 
        exp: newExp, 
        stage: newStage,
        lastFedAt: new Date()
      })
      .where(eq(caterpillars.id, caterpillar.id));

    const [updated] = await db.select().from(caterpillars).where(eq(caterpillars.id, caterpillar.id)).limit(1);

    return NextResponse.json({ caterpillar: updated, evolved: newStage > caterpillar.stage });
  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
