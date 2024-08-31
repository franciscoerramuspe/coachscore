import { connect } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { MongoClient, Db, Collection } from 'mongodb';

export interface User {
  _id?: ObjectId;
  clerkId: string;
  email: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createUser(
  data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>
) {
  try {
    console.log('Intentando crear usuario en createUser:', data);
    const db = await connect();
    console.log('Conexión a la base de datos establecida');
    const collection = db.collection('users');
    const newUser = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Usuario insertado en la base de datos:', newUser);
    if (newUser.insertedId) {
      const createdUser = await collection.findOne({ _id: newUser.insertedId });
      console.log('Usuario creado exitosamente:', createdUser);
      return { user: createdUser };
    } else {
      throw new Error('No se pudo insertar el usuario');
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getUserById({
  id,
  clerkUserId,
}: {
  id?: string;
  clerkUserId?: string;
}) {
  try {
    if (!id && !clerkUserId) {
      throw new Error('id or clerkUserId is required');
    }

    const db = await connect();
    const collection = db.collection('users');
    const query = id ? { _id: new ObjectId(id) } : { clerkId: clerkUserId };

    const user = await collection.findOne(query);
    return { user };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { error };
  }
}

export async function updateUser(id: string, data: Partial<User>) {
  try {
    const db = await connect();
    const collection = db.collection('users');
    const result = await collection.findOneAndUpdate(
      { clerkId: id },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error('User not found');
    }

    return { user: result.value };
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
