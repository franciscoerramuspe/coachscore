import { NextResponse } from 'next/server';
import { connect } from '../../../lib/db';
import Sport from '../../../models/Sport';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    await connect();
    const sports = await Sport.find();
    return NextResponse.json(sports);
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const { name } = await req.json();

    // Check if sport already exists
    const existingSport = await Sport.findOne({ name });
    if (existingSport) {
      return NextResponse.json(
        { error: 'Sport already exists' },
        { status: 400 }
      );
    }

    const newSport = new Sport({ sportId: uuidv4(), name });
    await newSport.save();
    return NextResponse.json(newSport, { status: 201 });
  } catch (error) {
    console.error('Error adding sport:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
