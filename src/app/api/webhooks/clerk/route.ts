import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clerkClient, WebhookEvent } from '@clerk/nextjs/server';
import { createUser } from '@/lib/users';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      photoUrl: image_url || undefined,
      firstName: first_name || undefined,
      lastName: last_name || undefined,
    };

    try {
      console.log('Intentando crear usuario en el webhook:', user);
      const result = await createUser(user);
      console.log('Resultado de createUser:', result);

      if (result.error) {
        console.error('Error creating user:', result.error);
        return NextResponse.json(
          { error: 'Failed to create user', details: result.error },
          { status: 500 }
        );
      }

      if (!result.user) {
        console.error('User creation failed: No user returned');
        return NextResponse.json(
          { error: 'User creation failed', details: 'No user returned' },
          { status: 500 }
        );
      }

      console.log('Usuario creado exitosamente en el webhook:', result.user);
      return NextResponse.json({
        message: 'New user created',
        user: result.user,
      });
    } catch (error) {
      console.error('Error in webhook:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error },
        { status: 500 }
      );
    }
  }
  console.log('Webhook processed successfully');
  return new Response('', { status: 200 });
}
