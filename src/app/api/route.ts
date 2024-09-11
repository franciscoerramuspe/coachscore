import { connect } from '../../lib/db';
import userModel from '../../lib/modals/user.modal';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
  try {
    await connect();

    const users = await userModel.find();

    return NextResponse.json({
      message: 'success from GET',
      status: 200,
      data: users,
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Errror from GET',
      status: 404,
      data: error,
    });
  }
};

export const POST = async (req: NextRequest) => {
  console.log('POST request received for user creation');
  try {
    console.log('Attempting to connect to database');
    await connect();
    console.log('Database connection successful');

    const { clerkId, email, photoUrl, firstName, lastName } = await req.json();
    console.log('Received user data:', {
      clerkId,
      email,
      photoUrl,
      firstName,
      lastName,
    });

    const users = await userModel.create({
      clerkId,
      email,
      photoUrl,
      firstName,
      lastName,
    });
    console.log('User created successfully:', users);

    return NextResponse.json({
      message: 'success from POST',
      status: 200,
      data: users,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      message: 'Error from POST',
      status: 500,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
