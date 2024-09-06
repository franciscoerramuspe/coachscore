import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';
import Sport from '@/models/Sport';

export async function GET(
  req: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    await connect();
    const { schoolId } = params;

    const coaches = await Coach.find({ schoolId })
      .select('coachId coachFirstName coachLastName sportId')
      .lean();

    if (!coaches || coaches.length === 0) {
      return NextResponse.json({ coaches: [] });
    }

    // Fetch sport names
    const sportIds = coaches.map((coach) => coach.sportId);
    const sports = await Sport.find({ sportId: { $in: sportIds } })
      .select('sportId name')
      .lean();

    const sportMap = new Map(
      sports.map((sport) => [sport.sportId, sport.name])
    );

    const coachesWithSportNames = coaches.map((coach) => ({
      ...coach,
      sportName: sportMap.get(coach.sportId) || 'Unknown',
    }));

    return NextResponse.json({ coaches: coachesWithSportNames });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
