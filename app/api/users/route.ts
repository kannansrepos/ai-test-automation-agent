import { currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { db, users } from '../../../db';
import { eq } from 'drizzle-orm';

const POST = async (_: NextRequest) => {
  const user = await currentUser();
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user?.primaryEmailAddress?.emailAddress ?? ''));
    console.log('Current user:', existingUser);

    if (existingUser.length <= 0) {
      const newUser = await db
        .insert(users)
        .values({
          email: user?.primaryEmailAddress?.emailAddress ?? '',
          name: user?.firstName ?? '',
        })
        .returning();
      return new Response(JSON.stringify(newUser), { status: 201 });
    } else {
      return new Response(JSON.stringify(existingUser), { status: 200 });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export { POST };
