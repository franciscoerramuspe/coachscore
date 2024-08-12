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
  try {
    await connect();
    const { clerkId, email, photoUrl, firstName, lastName } = await req.json();

    const users = await userModel.create({
      clerkId,
      email,
      photoUrl,
      firstName,
      lastName,
    });

    return NextResponse.json({
      message: 'success from POST',
      status: 200,
      data: users,
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Errror from POST',
      status: 404,
      data: error,
    });
  }
};
