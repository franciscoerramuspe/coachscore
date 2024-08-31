import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import School from '@/models/School';

export async function GET(req: Request) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const schools = await School.find({
      name: { $regex: query, $options: 'i' },
    })
      .skip(offset)
      .limit(limit)
      .select('schoolId name');

    const total = await School.countDocuments({
      name: { $regex: query, $options: 'i' },
    });

    return NextResponse.json({ schools: schools, total });
  } catch (error) {
    console.error('Error searching schools:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
