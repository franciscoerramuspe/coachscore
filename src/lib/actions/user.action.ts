'use server';

import { connect } from '@/lib/db';
import { ObjectId } from 'mongodb';

interface User {
  clerkId: string;
  email: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
}

export async function createUser(user: User) {
  try {
    console.log('Intentando crear usuario:', user);
    const db = await connect();
    const collection = db.collection('users');

    // Verificar si el usuario ya existe
    const existingUser = await collection.findOne({
      $or: [{ clerkId: user.clerkId }, { email: user.email }],
    });
    if (existingUser) {
      console.log('Usuario ya existe:', existingUser);
      return { user: existingUser };
    }

    // Crear nuevo usuario
    const newUser = await collection.insertOne({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const createdUser = await collection.findOne({ _id: newUser.insertedId });
    console.log('Nuevo usuario creado exitosamente:', createdUser);
    return { user: createdUser };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateUser(clerkId: string, userData: Partial<User>) {
  try {
    console.log('Intentando actualizar usuario:', clerkId, userData);
    const db = await connect();
    const collection = db.collection('users');

    const updatedUser = await collection.findOneAndUpdate(
      { clerkId },
      { $set: { ...userData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      console.log('Usuario no encontrado para actualizar');
      return { error: 'Usuario no encontrado' };
    }

    console.log('Usuario actualizado exitosamente:', updatedUser);
    return { user: updatedUser };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getUserById(id: string) {
  try {
    const db = await connect();
    const collection = db.collection('users');
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return { user };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const db = await connect();
    const collection = db.collection('users');
    const user = await collection.findOne({ clerkId });
    return { user };
  } catch (error) {
    console.error('Error al obtener usuario por clerkId:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
