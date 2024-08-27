'use server';

import { connect } from '@/lib/db';

export async function createUser(user: any) {
  try {
    console.log('Intentando crear usuario:', user);
    const db = await connect();
    const collection = db.collection('users');
    const newUser = await collection.insertOne({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Usuario creado exitosamente:', newUser);
    return { user: { _id: newUser.insertedId, ...user } };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { error };
  }
}
