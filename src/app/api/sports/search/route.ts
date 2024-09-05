import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Sport from '@/models/Sport';

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

    const sports = await Sport.find({
      name: { $regex: query, $options: 'i' },
    })
      .skip(offset)
      .limit(limit)
      .select('sportId name');

    const total = await Sport.countDocuments({
      name: { $regex: query, $options: 'i' },
    });

    return NextResponse.json({ sports, total });
  } catch (error) {
    console.error('Error searching sports:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
