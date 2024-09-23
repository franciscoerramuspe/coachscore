import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await connect();
    const { coachFirstName, coachLastName, school, sport } = await req.json();

    const newCoach = new Coach({
      coachId: uuidv4(),
      coachFirstName,
      coachLastName,
      schoolId: school,
      sportId: sport,
    });

    await newCoach.save();

    return NextResponse.json({ coachId: newCoach.coachId }, { status: 201 });
  } catch (error) {
    console.error('Error adding coach:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
