import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import School from '@/models/School';

export async function GET(req: Request) {
  try {
    await connect();
    const schools = await School.find().select('schoolId name');
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
