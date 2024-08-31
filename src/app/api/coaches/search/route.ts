import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';

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

    const coaches = await Coach.find({
      $or: [
        { coachFirstName: { $regex: query, $options: 'i' } },
        { coachLastName: { $regex: query, $options: 'i' } },
      ],
    })
      .skip(offset)
      .limit(limit)
      .select('coachId coachFirstName coachLastName schoolId sportId');

    const total = await Coach.countDocuments({
      $or: [
        { coachFirstName: { $regex: query, $options: 'i' } },
        { coachLastName: { $regex: query, $options: 'i' } },
      ],
    });

    return NextResponse.json({ coaches, total });
  } catch (error) {
    console.error('Error searching coaches:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
