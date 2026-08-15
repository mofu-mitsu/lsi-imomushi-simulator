import { db } from '../src/db/index';
import { users, caterpillars } from '../src/db/schema';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, selfType?: string) {
  await db.insert(users)
    .values({
      uid,
      email,
      selfType: selfType || null,
    })
    .onDuplicateKeyUpdate({
      set: {
        email,
        ...(selfType ? { selfType } : {})
      },
    });

  const [user] = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  return user;
}

export async function getOrCreateCaterpillar(userId: number) {
  let [caterpillar] = await db.select().from(caterpillars).where(eq(caterpillars.userId, userId)).limit(1);
  
  if (!caterpillar) {
    const [result] = await db.insert(caterpillars).values({
      userId,
      name: 'LSI芋虫',
      stage: 0,
      exp: 0,
    });
    
    // MySQL insert returns [ResultSetHeader, undefined]
    const newId = result.insertId;
    [caterpillar] = await db.select().from(caterpillars).where(eq(caterpillars.id, newId)).limit(1);
  }
  return caterpillar;
}
