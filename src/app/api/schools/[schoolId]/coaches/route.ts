import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';

export async function GET(
  req: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    await connect();
    const { schoolId } = params;

    const coaches = await Coach.find({ schoolId }).select(
      'coachId coachFirstName coachLastName sportId'
    );

    if (!coaches || coaches.length === 0) {
      return NextResponse.json({ coaches: [] });
    }

    return NextResponse.json({ coaches });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
