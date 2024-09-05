import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import School from '@/models/School';

export async function GET(
  req: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    await connect();
    const { schoolId } = params;

    const school = await School.findOne({ schoolId }).select(
      'schoolId name logo'
    );

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
