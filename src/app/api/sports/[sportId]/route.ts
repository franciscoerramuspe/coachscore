import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Sport from '@/models/Sport';

export async function GET(
  req: Request,
  { params }: { params: { sportId: string } }
) {
  try {
    await connect();
    const { sportId } = params;

    const sport = await Sport.findOne({ sportId }).select('sportId name');

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    return NextResponse.json(sport);
  } catch (error) {
    console.error('Error fetching sport:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
